import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import request from "supertest";

// ─── Mock db and service layer ────────────────────────────────────────────────

vi.mock("../../lib/db", () => ({ knex: vi.fn() }));
vi.mock("../../services/userService");
vi.mock("../../services/authService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../services/authService")>();
  return {
    ...actual,
    hashPassword: vi.fn().mockResolvedValue("hashed_password"),
  };
});

// ─── Imports ──────────────────────────────────────────────────────────────────

import app from "../../app";
import * as userService from "../../services/userService";
import { generateToken, hashPassword } from "../../services/authService";

// ─── Fixtures & helpers ───────────────────────────────────────────────────────

const mockUser = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+1234567890",
  role: "USER" as const,
  last_login: null,
  image: null,
  master_id: null,
  email_subscribed: true,
  created_at: new Date().toISOString(),
};

const mockUserListItem = {
  ...mockUser,
  appts_count: 3,
  last_appts: "2026-03-20",
  is_google_auth: false,
};

const mockUserRetrieve = {
  ...mockUser,
  master_data: null,
  is_google_auth: false,
};

function adminToken() {
  return generateToken({ id: "550e8400-e29b-41d4-a716-446655440000", email: "admin@example.com", role: "ADMIN" });
}

function userToken() {
  return generateToken({ id: "550e8400-e29b-41d4-a716-446655440002", email: "user@example.com", role: "USER" });
}

const createBody = { name: "Jane Doe", email: "jane@example.com", role: "USER", password: "securepass123" };

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
    (userService.getAllUsers as Mock).mockResolvedValue({
      data: [mockUserListItem],
      pagination: { currentPage: 1, perPage: 10, total: 1, lastPage: 1 },
    });

    const res = await request(app).get("/user").set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([mockUserListItem]);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it("returns 200 with empty array when no users", async () => {
    (userService.getAllUsers as Mock).mockResolvedValue({
      data: [],
      pagination: { currentPage: 1, perPage: 10, total: 0, lastPage: 1 },
    });

    const res = await request(app).get("/user").set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("passes search query param to service", async () => {
    (userService.getAllUsers as Mock).mockResolvedValue({
      data: [],
      pagination: { currentPage: 1, perPage: 10, total: 0, lastPage: 1 },
    });

    await request(app).get("/user?search=jane").set("Authorization", `Bearer ${adminToken()}`);

    expect(userService.getAllUsers).toHaveBeenCalledWith(expect.objectContaining({ search: "jane" }));
  });

  it("passes sort query param to service", async () => {
    (userService.getAllUsers as Mock).mockResolvedValue({
      data: [],
      pagination: { currentPage: 1, perPage: 10, total: 0, lastPage: 1 },
    });

    await request(app).get("/user?sort=name").set("Authorization", `Bearer ${adminToken()}`);

    expect(userService.getAllUsers).toHaveBeenCalledWith(expect.objectContaining({ sort: "name" }));
  });

  it("passes role filter to service", async () => {
    (userService.getAllUsers as Mock).mockResolvedValue({
      data: [],
      pagination: { currentPage: 1, perPage: 10, total: 0, lastPage: 1 },
    });

    await request(app).get("/user?role=ADMIN").set("Authorization", `Bearer ${adminToken()}`);

    expect(userService.getAllUsers).toHaveBeenCalledWith(expect.objectContaining({ role: "ADMIN" }));
  });

  it("passes master_id filter to service", async () => {
    (userService.getAllUsers as Mock).mockResolvedValue({
      data: [],
      pagination: { currentPage: 1, perPage: 10, total: 0, lastPage: 1 },
    });

    await request(app).get("/user?master_id=1").set("Authorization", `Bearer ${adminToken()}`);

    expect(userService.getAllUsers).toHaveBeenCalledWith(expect.objectContaining({ master_id: 1 }));
  });

  it("passes page and perPage params to service", async () => {
    (userService.getAllUsers as Mock).mockResolvedValue({
      data: [],
      pagination: { currentPage: 2, perPage: 5, total: 10, lastPage: 2 },
    });

    await request(app).get("/user?page=2&perPage=5").set("Authorization", `Bearer ${adminToken()}`);

    expect(userService.getAllUsers).toHaveBeenCalledWith(expect.objectContaining({ page: 2, perPage: 5 }));
  });

  it("returns 400 for invalid sort param", async () => {
    const res = await request(app).get("/user?sort=invalid").set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(400);
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

  it("returns 200 and user with master_data when ADMIN and user exists", async () => {
    (userService.getUserById as Mock).mockResolvedValue(mockUserRetrieve);

    const res = await request(app).get(`/user/${mockUser.id}`).set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(mockUser.email);
    expect(res.body).toHaveProperty("master_data");
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
    expect(hashPassword).toHaveBeenCalledWith("securepass123");
    expect(userService.createUser).toHaveBeenCalledWith(expect.objectContaining({ password: "hashed_password" }));
  });

  it("returns 201 with master_id and email_subscribed", async () => {
    const userWithMaster = { ...mockUser, master_id: 1, email_subscribed: false };
    (userService.createUser as Mock).mockResolvedValue(userWithMaster);

    const body = { ...createBody, master_id: 1, email_subscribed: false };
    const res = await request(app).post("/user").set("Authorization", `Bearer ${adminToken()}`).send(body);

    expect(res.status).toBe(201);
    expect(res.body.master_id).toBe(1);
    expect(res.body.email_subscribed).toBe(false);
  });

  it("returns 400 on missing required fields", async () => {
    const res = await request(app)
      .post("/user")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ email: "jane@example.com" }); // missing name, role, password

    expect(res.status).toBe(400);
  });

  it("returns 400 when password is too short", async () => {
    const res = await request(app)
      .post("/user")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ ...createBody, password: "short" });

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

  it("returns 200 when updating master_id and email_subscribed", async () => {
    const updated = { ...mockUser, master_id: 2, email_subscribed: false };
    (userService.updateUser as Mock).mockResolvedValue(updated);

    const res = await request(app)
      .put(`/user/${mockUser.id}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ master_id: 2, email_subscribed: false });

    expect(res.status).toBe(200);
    expect(res.body.master_id).toBe(2);
    expect(res.body.email_subscribed).toBe(false);
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

  it("hashes password when provided in update", async () => {
    const updated = { ...mockUser, name: "Jane Smith" };
    (userService.updateUser as Mock).mockResolvedValue(updated);

    const res = await request(app)
      .put(`/user/${mockUser.id}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ name: "Jane Smith", password: "newpassword123" });

    expect(res.status).toBe(200);
    expect(hashPassword).toHaveBeenCalledWith("newpassword123");
    expect(userService.updateUser).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({ password: "hashed_password" })
    );
  });

  it("does not hash password when null in update", async () => {
    const updated = { ...mockUser, name: "Jane Smith" };
    (userService.updateUser as Mock).mockResolvedValue(updated);
    (hashPassword as Mock).mockClear();

    const res = await request(app)
      .put(`/user/${mockUser.id}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ name: "Jane Smith", password: null });

    expect(res.status).toBe(200);
    expect(hashPassword).not.toHaveBeenCalled();
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
