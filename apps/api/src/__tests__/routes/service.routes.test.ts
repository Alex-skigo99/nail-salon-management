import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import request from "supertest";

// ─── Mock db and service layer ────────────────────────────────────────────────

vi.mock("../../lib/db", () => ({ knex: vi.fn() }));
vi.mock("../../services/serviceService");

// ─── Imports ──────────────────────────────────────────────────────────────────

import app from "../../app";
import * as serviceService from "../../services/serviceService";
import { generateToken } from "../../services/authService";

// ─── Fixtures & helpers ───────────────────────────────────────────────────────

const mockService = {
  id: 1,
  name: "Manicure",
  price: 30,
  duration_minutes: 45,
  description: "Basic manicure",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function adminToken() {
  return generateToken({ id: "uuid-admin", email: "admin@example.com", role: "ADMIN" });
}

function userToken() {
  return generateToken({ id: "uuid-user", email: "user@example.com", role: "USER" });
}

const serviceBody = { name: "Manicure", category: "manicure", price: "30.00", duration_minutes: 45 };

// ─── GET /service ─────────────────────────────────────────────────────────────

describe("GET /service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 and list of services (public route)", async () => {
    (serviceService.getAllServices as Mock).mockResolvedValue([mockService]);

    const res = await request(app).get("/service");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockService]);
  });

  it("returns 200 with empty array when no services", async () => {
    (serviceService.getAllServices as Mock).mockResolvedValue([]);

    const res = await request(app).get("/service");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ─── POST /service ────────────────────────────────────────────────────────────

describe("POST /service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).post("/service").send(serviceBody);
    expect(res.status).toBe(401);
  });

  it("returns 403 when authenticated as USER role", async () => {
    const res = await request(app).post("/service").set("Authorization", `Bearer ${userToken()}`).send(serviceBody);
    expect(res.status).toBe(403);
  });

  it("returns 201 and created service when ADMIN creates service", async () => {
    (serviceService.createService as Mock).mockResolvedValue(mockService);

    const res = await request(app).post("/service").set("Authorization", `Bearer ${adminToken()}`).send(serviceBody);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe(mockService.name);
  });

  it("returns 400 on missing required fields", async () => {
    const res = await request(app)
      .post("/service")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ name: "Incomplete" }); // missing price and duration_minutes

    expect(res.status).toBe(400);
  });
});

// ─── PUT /service/:id ─────────────────────────────────────────────────────────

describe("PUT /service/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).put("/service/1").send({ name: "Updated" });
    expect(res.status).toBe(401);
  });

  it("returns 200 and updated service when ADMIN updates", async () => {
    const updated = { ...mockService, name: "Gel Manicure" };
    (serviceService.updateService as Mock).mockResolvedValue(updated);

    const res = await request(app)
      .put("/service/1")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ name: "Gel Manicure" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Gel Manicure");
  });

  it("returns 404 when service does not exist", async () => {
    (serviceService.updateService as Mock).mockResolvedValue(null);

    const res = await request(app)
      .put("/service/999")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
  });
});

// ─── DELETE /service/:id ──────────────────────────────────────────────────────

describe("DELETE /service/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).delete("/service/1");
    expect(res.status).toBe(401);
  });

  it("returns 204 when ADMIN deletes an existing service", async () => {
    (serviceService.deleteService as Mock).mockResolvedValue(true);

    const res = await request(app).delete("/service/1").set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(204);
  });

  it("returns 404 when service does not exist", async () => {
    (serviceService.deleteService as Mock).mockResolvedValue(false);

    const res = await request(app).delete("/service/999").set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(404);
  });
});
