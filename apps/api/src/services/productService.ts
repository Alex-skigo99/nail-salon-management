import { knex } from "../lib/db";
import { DB_TABLES } from "../constants/dbTables";
import type { Product, ProductHome, ProductCreate, ProductUpdate } from "../types/dbSchemaTypes";
import type { IWithPagination } from "knex-paginate";
import { resolveImageUrl, isS3Key, deleteObject } from "./s3Service";

async function enrichProductImage<T extends { image: string | null }>(product: T): Promise<T> {
  return { ...product, image: await resolveImageUrl(product.image ?? null) };
}

export interface GetAllProductsParams {
  search?: string;
  sort?: string;
  type?: string;
  is_available?: string;
  is_home_display?: string;
  page?: number;
  perPage?: number;
}

export const getAllProducts = async (params: GetAllProductsParams = {}): Promise<IWithPagination<Product>> => {
  const { page = 1, perPage = 10 } = params;
  const query = knex(DB_TABLES.PRODUCTS).select("*");

  if (params.search) {
    const term = `%${params.search}%`;
    query.whereILike("title", term);
  }

  if (params.type) {
    query.where("type", params.type);
  }

  if (params.is_available !== undefined) {
    query.where("is_available", params.is_available === "true");
  }

  if (params.is_home_display !== undefined) {
    query.where("is_home_display", params.is_home_display === "true");
  }

  switch (params.sort) {
    case "name_asc":
      query.orderByRaw("LOWER(title) ASC");
      break;
    case "name_desc":
      query.orderByRaw("LOWER(title) DESC");
      break;
    case "quantity_asc":
      query.orderBy("quantity", "asc");
      break;
    case "quantity_desc":
      query.orderBy("quantity", "desc");
      break;
    case "price_asc":
      query.orderBy("price", "asc");
      break;
    case "price_desc":
      query.orderBy("price", "desc");
      break;
    case "created_desc":
      query.orderBy("created_at", "desc");
      break;
    default:
      query.orderBy("created_at", "desc");
  }

  const products = await query.paginate({ currentPage: page, perPage, isLengthAware: true });
  const dataWithImages = await Promise.all(products.data.map(enrichProductImage));
  return { ...products, data: dataWithImages };
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const product = await knex(DB_TABLES.PRODUCTS).where({ id }).first();
  if (!product) return null;
  return enrichProductImage(product);
};

export const getHomeProducts = async (): Promise<ProductHome[]> => {
  const products = await knex(DB_TABLES.PRODUCTS)
    .select(
      "id",
      "title",
      "description",
      "price",
      "discount",
      "type",
      "image",
      "is_available",
      "is_home_display",
      "home_sorting"
    )
    .where({ is_available: true, is_home_display: true })
    .orderBy([
      { column: "home_sorting", order: "asc" },
      { column: "created_at", order: "desc" },
    ]);
  return Promise.all(products.map(enrichProductImage));
};

export const createProduct = async (data: Partial<ProductCreate>): Promise<Product> => {
  const [product] = await knex(DB_TABLES.PRODUCTS).insert(data).returning("*");
  return enrichProductImage(product);
};

export const updateProduct = async (id: string, data: ProductUpdate): Promise<Product | null> => {
  if (data.image !== undefined) {
    const existing = await knex(DB_TABLES.PRODUCTS).where({ id }).select("image").first();
    if (existing && isS3Key(existing.image)) {
      await deleteObject(existing.image).catch(() => {});
    }
  }
  const [product] = await knex(DB_TABLES.PRODUCTS)
    .where({ id })
    .update({ ...data, updated_at: new Date().toISOString() })
    .returning("*");
  if (!product) return null;
  return enrichProductImage(product);
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  const existing = await knex(DB_TABLES.PRODUCTS).where({ id }).select("image").first();
  const deleted = await knex(DB_TABLES.PRODUCTS).where({ id }).delete();
  if (deleted > 0 && existing && isS3Key(existing.image)) {
    await deleteObject(existing.image).catch(() => {});
  }
  return deleted > 0;
};
