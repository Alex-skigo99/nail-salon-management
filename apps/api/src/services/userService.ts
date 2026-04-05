import { knex } from "../lib/db";
import { DB_TABLES } from "../constants/dbTables";
import { User, UserRetrieve, UserListItem } from "../types/dbSchemaTypes";
import type { IWithPagination } from "knex-paginate";
import { resolveImageUrl, isS3Key, deleteObject } from "./s3Service";

type SafeUser = Omit<User, "password" | "google_id">;

const SAFE_COLUMNS: (keyof User)[] = [
  "id",
  "name",
  "email",
  "phone",
  "role",
  "last_login",
  "image",
  "master_id",
  "email_subscribed",
  "language",
  "created_at",
];

const masterDataSelect = `CASE WHEN m.id IS NULL THEN NULL
              ELSE json_build_object(
                'id', m.id,
                'name', m.name,
                'description', m.description
              )
         END AS master_data`;

export interface GetAllUsersParams {
  search?: string;
  sort?: "name" | "appts_count" | "created_asc" | "created_desc" | "last_appts";
  role?: "ADMIN" | "USER";
  master_id?: number;
  page?: number;
  perPage?: number;
}

export const getAllUsers = async (params: GetAllUsersParams = {}): Promise<IWithPagination<UserListItem>> => {
  const { page = 1, perPage = 10 } = params;
  const query = knex(`${DB_TABLES.USERS} as u`)
    .select(SAFE_COLUMNS.map((c) => `u.${c}`))
    .select(knex.raw(`COALESCE(appts.cnt, 0)::int AS appts_count`), knex.raw(`appts.last_date AS last_appts`))
    .select(knex.raw(`(u.google_id IS NOT NULL) AS is_google_auth`))
    .leftJoin(
      knex(DB_TABLES.APPOINTMENTS)
        .select("user_id")
        .count("* as cnt")
        .max("date as last_date")
        .groupBy("user_id")
        .as("appts"),
      "u.id",
      "appts.user_id"
    );

  if (params.search) {
    const term = `%${params.search}%`;
    query.where(function () {
      this.whereILike("u.name", term).orWhereILike("u.email", term).orWhereILike("u.phone", term);
    });
  }

  if (params.role) {
    query.where("u.role", params.role);
  }

  if (params.master_id !== undefined) {
    query.where("u.master_id", params.master_id);
  }

  switch (params.sort) {
    case "name":
      query.orderByRaw("LOWER(u.name) ASC");
      break;
    case "appts_count":
      query.orderBy("appts_count", "desc");
      break;
    case "created_asc":
      query.orderBy("u.created_at", "asc");
      break;
    case "created_desc":
      query.orderBy("u.created_at", "desc");
      break;
    case "last_appts":
      query.orderByRaw("appts.last_date DESC NULLS LAST");
      break;
    default:
      query.orderBy("u.created_at", "desc");
  }

  const users = await query.paginate({ currentPage: page, perPage, isLengthAware: true });
  const dataWithResolvedImages = await Promise.all(
    users.data.map(async (user) => ({
      ...user,
      image: await resolveImageUrl(user.image ?? null),
    }))
  );
  return { ...users, data: dataWithResolvedImages };
};

export const getUserById = async (id: string): Promise<UserRetrieve | null> => {
  const user = await knex(`${DB_TABLES.USERS} as u`)
    .select(SAFE_COLUMNS.map((c) => `u.${c}`))
    .select(knex.raw(masterDataSelect))
    .select(knex.raw(`(u.google_id IS NOT NULL) AS is_google_auth`))
    .select(knex.raw(`COALESCE(appts.cnt, 0)::int AS appts_count`), knex.raw(`appts.last_date AS last_appts`))
    .leftJoin(`${DB_TABLES.MASTERS} as m`, "u.master_id", "m.id")
    .leftJoin(
      knex(DB_TABLES.APPOINTMENTS)
        .select("user_id")
        .count("* as cnt")
        .max("date as last_date")
        .groupBy("user_id")
        .as("appts"),
      "u.id",
      "appts.user_id"
    )
    .where("u.id", id)
    .first();
  if (!user) return null;
  user.image = await resolveImageUrl(user.image);
  return user;
};

export const createUser = async (
  data: Pick<User, "name" | "email" | "role"> &
    Partial<Pick<User, "phone" | "image" | "master_id" | "email_subscribed" | "password" | "language">>
): Promise<SafeUser> => {
  const [user] = await knex(DB_TABLES.USERS).insert(data).returning(SAFE_COLUMNS);
  return user;
};

export const updateUser = async (
  id: string,
  data: Partial<
    Pick<
      User,
      "name" | "email" | "phone" | "role" | "image" | "master_id" | "email_subscribed" | "password" | "language"
    >
  >
): Promise<SafeUser | null> => {
  // Clean up old S3 image if being replaced
  if (data.image !== undefined) {
    const existing = await knex(DB_TABLES.USERS).where({ id }).select("image").first();
    if (existing && isS3Key(existing.image)) {
      await deleteObject(existing.image).catch(() => {});
    }
  }
  const [user] = await knex(DB_TABLES.USERS).where({ id }).update(data).returning(SAFE_COLUMNS);
  return user ?? null;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const existing = await knex(DB_TABLES.USERS).where({ id }).select("image").first();
  const deleted = await knex(DB_TABLES.USERS).where({ id }).delete();
  if (deleted > 0 && existing && isS3Key(existing.image)) {
    await deleteObject(existing.image).catch(() => {});
  }
  return deleted > 0;
};

export const getUserNameById = async (id: string): Promise<string | null> => {
  const user = await knex(DB_TABLES.USERS).where({ id }).select("name").first();
  return user ? user.name : null;
};
