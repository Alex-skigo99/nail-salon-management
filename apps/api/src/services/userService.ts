import { knex } from "../lib/db";
import { DB_TABLES } from "../constants/dbTables";
import { User, UserRetrieve, UserListItem } from "../types/dbSchemaTypes";
import type { IWithPagination } from "knex-paginate";

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

  return query.paginate({ currentPage: page, perPage, isLengthAware: true });
};

export const getUserById = async (id: string): Promise<UserRetrieve | null> => {
  const user = await knex(`${DB_TABLES.USERS} as u`)
    .select(SAFE_COLUMNS.map((c) => `u.${c}`))
    .select(knex.raw(masterDataSelect))
    .select(knex.raw(`(u.google_id IS NOT NULL) AS is_google_auth`))
    .leftJoin(`${DB_TABLES.MASTERS} as m`, "u.master_id", "m.id")
    .where("u.id", id)
    .first();
  return user ?? null;
};

export const createUser = async (
  data: Pick<User, "name" | "email" | "role"> &
    Partial<Pick<User, "phone" | "image" | "master_id" | "email_subscribed" | "password">>
): Promise<SafeUser> => {
  const [user] = await knex(DB_TABLES.USERS).insert(data).returning(SAFE_COLUMNS);
  return user;
};

export const updateUser = async (
  id: string,
  data: Partial<
    Pick<User, "name" | "email" | "phone" | "role" | "image" | "master_id" | "email_subscribed" | "password">
  >
): Promise<SafeUser | null> => {
  const [user] = await knex(DB_TABLES.USERS).where({ id }).update(data).returning(SAFE_COLUMNS);
  return user ?? null;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const deleted = await knex(DB_TABLES.USERS).where({ id }).delete();
  return deleted > 0;
};
