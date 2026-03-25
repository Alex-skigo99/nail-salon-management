import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import request from "supertest";

// ─── Mock db and service layer ────────────────────────────────────────────────

vi.mock("../../lib/db", () => ({ knex: vi.fn() }));
vi.mock("../../services/masterService");

// ─── Imports ──────────────────────────────────────────────────────────────────

import app from "../../app";
import * as masterService from "../../services/masterService";
import { generateToken } from "../../services/authService";

// ─── Fixtures & helpers ───────────────────────────────────────────────────────

const mockMaster = {
  id: 1,
  name: "Jane Doe",
  description: "Senior nail technician",
};

function adminToken() {
  return generateToken({ id: "uuid-admin", email: "admin@example.com", role: "ADMIN" });
}

function userToken() {
  return generateToken({ id: "uuid-user", email: "user@example.com", role: "USER" });
}

// ─── GET /master ──────────────────────────────────────────────────────────────

describe("GET /master", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/master");
    expect(res.status).toBe(401);
  });

  it("returns 200 when authenticated as USER role", async () => {
    const res = await request(app).get("/master").set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(200);
  });

  it("returns 200 and list of masters when ADMIN", async () => {
    (masterService.getAllMasters as Mock).mockResolvedValue([mockMaster]);

    const res = await request(app).get("/master").set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockMaster]);
  });

  it("returns 200 with empty array when no masters", async () => {
    (masterService.getAllMasters as Mock).mockResolvedValue([]);

    const res = await request(app).get("/master").set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ─── POST /master ─────────────────────────────────────────────────────────────

describe("POST /master", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).post("/master").send({ name: "Jane Doe" });
    expect(res.status).toBe(401);
  });

  it("returns 403 when authenticated as USER role", async () => {
    const res = await request(app)
      .post("/master")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ name: "Jane Doe" });
    expect(res.status).toBe(403);
  });

  it("returns 201 and created master when ADMIN", async () => {
    (masterService.createMaster as Mock).mockResolvedValue(mockMaster);

    const res = await request(app)
      .post("/master")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ name: "Jane Doe", description: "Senior nail technician" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe(mockMaster.name);
  });

  it("returns 400 on missing required fields", async () => {
    const res = await request(app).post("/master").set("Authorization", `Bearer ${adminToken()}`).send({}); // missing name

    expect(res.status).toBe(400);
  });
});

// ─── PUT /master/:id ──────────────────────────────────────────────────────────

describe("PUT /master/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).put("/master/1").send({ name: "Updated" });
    expect(res.status).toBe(401);
  });

  it("returns 403 when authenticated as USER", async () => {
    const res = await request(app)
      .put("/master/1")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ name: "Updated" });
    expect(res.status).toBe(403);
  });

  it("returns 200 and updated master when ADMIN", async () => {
    const updated = { ...mockMaster, name: "Jane Smith" };
    (masterService.updateMaster as Mock).mockResolvedValue(updated);

    const res = await request(app)
      .put("/master/1")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ name: "Jane Smith" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Jane Smith");
  });

  it("returns 404 when master does not exist", async () => {
    (masterService.updateMaster as Mock).mockResolvedValue(null);

    const res = await request(app)
      .put("/master/999")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
  });
});

// ─── DELETE /master/:id ───────────────────────────────────────────────────────

describe("DELETE /master/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).delete("/master/1");
    expect(res.status).toBe(401);
  });

  it("returns 403 when authenticated as USER", async () => {
    const res = await request(app).delete("/master/1").set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(403);
  });

  it("returns 204 when ADMIN deletes an existing master", async () => {
    (masterService.deleteMaster as Mock).mockResolvedValue(true);

    const res = await request(app).delete("/master/1").set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(204);
  });

  it("returns 404 when master does not exist", async () => {
    (masterService.deleteMaster as Mock).mockResolvedValue(false);

    const res = await request(app).delete("/master/999").set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(404);
  });
});
