import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import request from "supertest";

// ─── Mock db and service layer ────────────────────────────────────────────────

vi.mock("../../lib/db", () => ({ knex: vi.fn() }));
vi.mock("../../services/userService");

// ─── Imports ──────────────────────────────────────────────────────────────────

import app from "../../app";
import * as userService from "../../services/userService";
import { generateToken } from "../../services/authService";

// ─── Fixtures & helpers ───────────────────────────────────────────────────────

const mockUser = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+1234567890",
  role: "USER" as const,
  last_login: null,
  image: null,
  created_at: new Date().toISOString(),
};

function adminToken() {
  return generateToken({ id: "550e8400-e29b-41d4-a716-446655440000", email: "admin@example.com", role: "ADMIN" });
}

function userToken() {
  return generateToken({ id: "550e8400-e29b-41d4-a716-446655440002", email: "user@example.com", role: "USER" });
}

const createBody = { name: "Jane Doe", email: "jane@example.com", role: "USER" };

// ─── GET /user ────────────────────────────────────────────────────────────────

describe("GET /user", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/user");
    expect(res.status).toBe(401);
  });

  it("returns 403 when authenticated as USER role", async () => {
    const res = await request(app).get("/user").set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(403);
  });

  it("returns 200 and list of users when ADMIN", async () => {
    (userService.getAllUsers as Mock).mockResolvedValue([mockUser]);

    const res = await request(app).get("/user").set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockUser]);
  });

  it("returns 200 with empty array when no users", async () => {
    (userService.getAllUsers as Mock).mockResolvedValue([]);

    const res = await request(app).get("/user").set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ─── GET /user/:id ────────────────────────────────────────────────────────────

describe("GET /user/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get(`/user/${mockUser.id}`);
    expect(res.status).toBe(401);
  });

  it("returns 403 when USER role", async () => {
    const res = await request(app).get(`/user/${mockUser.id}`).set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(403);
  });

  it("returns 200 and user when ADMIN and user exists", async () => {
    (userService.getUserById as Mock).mockResolvedValue(mockUser);

    const res = await request(app).get(`/user/${mockUser.id}`).set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(mockUser.email);
  });

  it("returns 404 when user does not exist", async () => {
    (userService.getUserById as Mock).mockResolvedValue(null);

    const res = await request(app)
      .get("/user/550e8400-e29b-41d4-a716-446655440099")
      .set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid (non-UUID) id", async () => {
    const res = await request(app).get("/user/not-a-uuid").set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(400);
  });
});

// ─── POST /user ───────────────────────────────────────────────────────────────

describe("POST /user", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).post("/user").send(createBody);
    expect(res.status).toBe(401);
  });

  it("returns 403 when USER role", async () => {
    const res = await request(app).post("/user").set("Authorization", `Bearer ${userToken()}`).send(createBody);
    expect(res.status).toBe(403);
  });

  it("returns 201 and created user when ADMIN", async () => {
    (userService.createUser as Mock).mockResolvedValue(mockUser);

    const res = await request(app).post("/user").set("Authorization", `Bearer ${adminToken()}`).send(createBody);

    expect(res.status).toBe(201);
    expect(res.body.email).toBe(mockUser.email);
  });

  it("returns 400 on missing required fields", async () => {
    const res = await request(app)
      .post("/user")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ email: "jane@example.com" }); // missing name, role

    expect(res.status).toBe(400);
  });

  it("returns 400 on invalid email", async () => {
    const res = await request(app)
      .post("/user")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ ...createBody, email: "not-an-email" });

    expect(res.status).toBe(400);
  });

  it("returns 400 on invalid role", async () => {
    const res = await request(app)
      .post("/user")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ ...createBody, role: "SUPERUSER" });

    expect(res.status).toBe(400);
  });
});

// ─── PUT /user/:id ────────────────────────────────────────────────────────────

describe("PUT /user/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).put(`/user/${mockUser.id}`).send({ name: "Updated" });
    expect(res.status).toBe(401);
  });

  it("returns 403 when USER role", async () => {
    const res = await request(app)
      .put(`/user/${mockUser.id}`)
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ name: "Updated" });
    expect(res.status).toBe(403);
  });

  it("returns 200 and updated user when ADMIN", async () => {
    const updated = { ...mockUser, name: "Jane Smith" };
    (userService.updateUser as Mock).mockResolvedValue(updated);

    const res = await request(app)
      .put(`/user/${mockUser.id}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ name: "Jane Smith" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Jane Smith");
  });

  it("returns 404 when user does not exist", async () => {
    (userService.updateUser as Mock).mockResolvedValue(null);

    const res = await request(app)
      .put("/user/550e8400-e29b-41d4-a716-446655440099")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid UUID", async () => {
    const res = await request(app)
      .put("/user/not-a-uuid")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ name: "X" });
    expect(res.status).toBe(400);
  });
});

// ─── DELETE /user/:id ─────────────────────────────────────────────────────────

describe("DELETE /user/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).delete(`/user/${mockUser.id}`);
    expect(res.status).toBe(401);
  });

  it("returns 403 when USER role", async () => {
    const res = await request(app).delete(`/user/${mockUser.id}`).set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(403);
  });

  it("returns 204 when ADMIN deletes an existing user", async () => {
    (userService.deleteUser as Mock).mockResolvedValue(true);

    const res = await request(app).delete(`/user/${mockUser.id}`).set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(204);
  });

  it("returns 404 when user does not exist", async () => {
    (userService.deleteUser as Mock).mockResolvedValue(false);

    const res = await request(app)
      .delete("/user/550e8400-e29b-41d4-a716-446655440099")
      .set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid UUID", async () => {
    const res = await request(app).delete("/user/not-a-uuid").set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(400);
  });
});
