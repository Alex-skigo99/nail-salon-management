import { Request, Response } from "express";
import { z } from "zod";
import * as productService from "../services/productService";

/**
 * @openapi
 * /product/home:
 *   get:
 *     summary: Get products for home page display (public)
 *     tags:
 *       - Product
 *     responses:
 *       200:
 *         description: List of products marked for home display
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductHome'
 *       500:
 *         description: Internal server error
 *
 * /product:
 *   get:
 *     summary: Retrieve a paginated list of products (ADMIN only)
 *     tags:
 *       - Product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name_asc, name_desc, quantity_asc, quantity_desc, created_desc, price_asc, price_desc]
 *         description: Sort order
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [nail_care, tools, accessories, other]
 *         description: Filter by product type
 *       - in: query
 *         name: is_available
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filter by availability
 *       - in: query
 *         name: is_home_display
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filter by home display flag
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Paginated list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     perPage:
 *                       type: integer
 *                     from:
 *                       type: integer
 *                     to:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     lastPage:
 *                       type: integer
 *                     prevPage:
 *                       type: integer
 *                     nextPage:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new product (ADMIN only)
 *     tags:
 *       - Product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       201:
 *         description: Created product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *
 * /product/{id}:
 *   get:
 *     summary: Get a product by ID (ADMIN only)
 *     tags:
 *       - Product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: A single product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update a product (ADMIN only)
 *     tags:
 *       - Product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdate'
 *     responses:
 *       200:
 *         description: Updated product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a product (ADMIN only)
 *     tags:
 *       - Product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     responses:
 *       204:
 *         description: No content (deleted)
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

const CreateProductSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  price: z.string().min(1),
  discount: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  quantity: z.number().int().min(0).optional(),
  image: z.string().nullable().optional(),
  is_available: z.boolean().optional(),
  is_home_display: z.boolean().optional(),
  home_sorting: z.number().int().min(0).optional(),
  comment: z.string().nullable().optional(),
});

const UpdateProductSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  price: z.string().min(1).optional(),
  discount: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  quantity: z.number().int().min(0).optional(),
  image: z.string().nullable().optional(),
  is_available: z.boolean().optional(),
  is_home_display: z.boolean().optional(),
  home_sorting: z.number().int().min(0).optional(),
  comment: z.string().nullable().optional(),
});

const GetAllProductsQuerySchema = z.object({
  search: z.string().optional(),
  sort: z
    .enum(["name_asc", "name_desc", "quantity_asc", "quantity_desc", "created_desc", "price_asc", "price_desc"])
    .optional(),
  type: z.string().optional(),
  is_available: z.enum(["true", "false"]).optional(),
  is_home_display: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  perPage: z.coerce.number().int().positive().optional(),
});

const ProductIdParamSchema = z.object({
  id: z.uuid({ version: "v4" }),
});

export const getHomeProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await productService.getHomeProducts();
    res.json(products);
  } catch (err) {
    console.error("Error fetching home products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = GetAllProductsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const products = await productService.getAllProducts(parsed.data);
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = ProductIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const product = await productService.getProductById(parsed.data.id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = CreateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const product = await productService.createProduct(parsed.data);
    res.status(201).json(product);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedId = ProductIdParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = UpdateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const product = await productService.updateProduct(parsedId.data.id, parsed.data);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedId = ProductIdParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const deleted = await productService.deleteProduct(parsedId.data.id);
    if (!deleted) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
