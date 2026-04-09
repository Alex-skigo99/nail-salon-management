import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import request from "supertest";

// ─── Mock db and service layer ────────────────────────────────────────────────

vi.mock("../../lib/db", () => ({ knex: vi.fn() }));
vi.mock("../../services/productService");

// ─── Imports ──────────────────────────────────────────────────────────────────

import app from "../../app";
import * as productService from "../../services/productService";
import { generateToken } from "../../services/authService";

// ─── Fixtures & helpers ───────────────────────────────────────────────────────

const mockProduct = {
  id: "3d3d89d1-0de8-45d7-a65e-8bf4c7ede659",
  title: "Nail Polish Remover",
  description: "Gentle acetone-free remover",
  price: "12.99",
  discount: null,
  type: "nail_care",
  quantity: 50,
  image: null,
  is_available: true,
  is_home_display: true,
  home_sorting: 100,
  comment: "Best seller",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockHomeProduct = {
  id: "3d3d89d1-0de8-45d7-a65e-8bf4c7ede659",
  title: "Nail Polish Remover",
  description: "Gentle acetone-free remover",
  price: "12.99",
  discount: null,
  type: "nail_care",
  image: null,
  is_available: true,
  is_home_display: true,
  home_sorting: 100,
};

function adminToken() {
  return generateToken({ id: "3d3d89d1-0de8-45d7-a65e-8bf4c7ede659", email: "admin@example.com", role: "ADMIN" });
}

function userToken() {
  return generateToken({ id: "3d3d89d1-0de8-45d7-a65e-8bf4c7ede659", email: "user@example.com", role: "USER" });
}

const productBody = {
  title: "Nail Polish Remover",
  price: "12.99",
  type: "nail_care",
};

// ─── GET /product/home ────────────────────────────────────────────────────────

describe("GET /product/home", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 and list of home products (public route)", async () => {
    (productService.getHomeProducts as Mock).mockResolvedValue([mockHomeProduct]);

    const res = await request(app).get("/product/home");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockHomeProduct]);
  });

  it("returns 200 with empty array when no home products", async () => {
    (productService.getHomeProducts as Mock).mockResolvedValue([]);

    const res = await request(app).get("/product/home");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ─── GET /product ─────────────────────────────────────────────────────────────

describe("GET /product", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/product");
    expect(res.status).toBe(401);
  });

  it("returns 403 when authenticated as USER role", async () => {
    const res = await request(app).get("/product").set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(403);
  });

  it("returns 200 and paginated products for ADMIN", async () => {
    const paginated = {
      data: [mockProduct],
      pagination: { currentPage: 1, perPage: 10, total: 1, lastPage: 1 },
    };
    (productService.getAllProducts as Mock).mockResolvedValue(paginated);

    const res = await request(app).get("/product").set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe(mockProduct.title);
  });
});

// ─── GET /product/:id ─────────────────────────────────────────────────────────

describe("GET /product/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/product/3d3d89d1-0de8-45d7-a65e-8bf4c7ede659");
    expect(res.status).toBe(401);
  });

  it("returns 200 and product for ADMIN", async () => {
    (productService.getProductById as Mock).mockResolvedValue(mockProduct);

    const res = await request(app)
      .get("/product/3d3d89d1-0de8-45d7-a65e-8bf4c7ede659")
      .set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(mockProduct.title);
  });

  it("returns 404 when product does not exist", async () => {
    (productService.getProductById as Mock).mockResolvedValue(null);

    const res = await request(app)
      .get("/product/6725538f-a7b6-4b8b-a550-d401fc5a5e0b")
      .set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(404);
  });
});

// ─── POST /product ────────────────────────────────────────────────────────────

describe("POST /product", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).post("/product").send(productBody);
    expect(res.status).toBe(401);
  });

  it("returns 403 when authenticated as USER role", async () => {
    const res = await request(app).post("/product").set("Authorization", `Bearer ${userToken()}`).send(productBody);
    expect(res.status).toBe(403);
  });

  it("returns 201 and created product when ADMIN creates product", async () => {
    (productService.createProduct as Mock).mockResolvedValue(mockProduct);

    const res = await request(app).post("/product").set("Authorization", `Bearer ${adminToken()}`).send(productBody);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe(mockProduct.title);
  });

  it("returns 400 on missing required fields", async () => {
    const res = await request(app)
      .post("/product")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ title: "Incomplete" }); // missing price and type

    expect(res.status).toBe(400);
  });
});

// ─── PUT /product/:id ─────────────────────────────────────────────────────────

describe("PUT /product/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).put("/product/3d3d89d1-0de8-45d7-a65e-8bf4c7ede659").send({ title: "Updated" });
    expect(res.status).toBe(401);
  });

  it("returns 200 and updated product when ADMIN updates", async () => {
    const updated = { ...mockProduct, title: "Updated Polish" };
    (productService.updateProduct as Mock).mockResolvedValue(updated);

    const res = await request(app)
      .put("/product/3d3d89d1-0de8-45d7-a65e-8bf4c7ede659")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ title: "Updated Polish" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated Polish");
  });

  it("returns 404 when product does not exist", async () => {
    (productService.updateProduct as Mock).mockResolvedValue(null);

    const res = await request(app)
      .put("/product/6725538f-a7b6-4b8b-a550-d401fc5a5e0b")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ title: "Ghost" });

    expect(res.status).toBe(404);
  });
});

// ─── DELETE /product/:id ──────────────────────────────────────────────────────

describe("DELETE /product/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).delete("/product/3d3d89d1-0de8-45d7-a65e-8bf4c7ede659");
    expect(res.status).toBe(401);
  });

  it("returns 204 when ADMIN deletes an existing product", async () => {
    (productService.deleteProduct as Mock).mockResolvedValue(true);

    const res = await request(app)
      .delete("/product/3d3d89d1-0de8-45d7-a65e-8bf4c7ede659")
      .set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(204);
  });

  it("returns 404 when product does not exist", async () => {
    (productService.deleteProduct as Mock).mockResolvedValue(false);

    const res = await request(app)
      .delete("/product/6725538f-a7b6-4b8b-a550-d401fc5a5e0b")
      .set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(404);
  });
});
