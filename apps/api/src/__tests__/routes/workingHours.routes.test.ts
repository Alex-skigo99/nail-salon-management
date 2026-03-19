import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import request from "supertest";

// ─── Mock db and service layer ────────────────────────────────────────────────

vi.mock("../../lib/db", () => ({ knex: vi.fn() }));
vi.mock("../../services/workingHoursService");

// ─── Imports ──────────────────────────────────────────────────────────────────

import app from "../../app";
import * as workingHoursService from "../../services/workingHoursService";
import { generateToken } from "../../services/authService";

// ─── Fixtures & helpers ───────────────────────────────────────────────────────

const mockWorkingHours = [
  { id: 1, master_id: 1, day_of_week: 1, start_time: "09:00", end_time: "18:00" },
  { id: 2, master_id: 1, day_of_week: 2, start_time: "09:00", end_time: "18:00" },
];

function adminToken() {
  return generateToken({ id: "uuid-admin", email: "admin@example.com", role: "ADMIN" });
}

function userToken() {
  return generateToken({ id: "uuid-user", email: "user@example.com", role: "USER" });
}

const replaceBody = {
  master_id: 1,
  records: [
    { day_of_week: 1, start_time: "09:00", end_time: "18:00" },
    { day_of_week: 2, start_time: "09:00", end_time: "18:00" },
  ],
};

// ─── GET /working_hours ───────────────────────────────────────────────────────

describe("GET /working_hours", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/working_hours").query({ master_id: "1" });
    expect(res.status).toBe(401);
  });

  it("returns 403 when authenticated as USER role", async () => {
    const res = await request(app)
      .get("/working_hours")
      .set("Authorization", `Bearer ${userToken()}`)
      .query({ master_id: "1" });
    expect(res.status).toBe(403);
  });

  it("returns 200 and working hours when ADMIN with valid master_id", async () => {
    (workingHoursService.getWorkingHoursByMaster as Mock).mockResolvedValue(mockWorkingHours);

    const res = await request(app)
      .get("/working_hours")
      .set("Authorization", `Bearer ${adminToken()}`)
      .query({ master_id: "1" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockWorkingHours);
  });

  it("returns 400 when master_id query param is missing", async () => {
    const res = await request(app).get("/working_hours").set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(400);
  });

  it("returns 400 when master_id is not a number", async () => {
    const res = await request(app)
      .get("/working_hours")
      .set("Authorization", `Bearer ${adminToken()}`)
      .query({ master_id: "abc" });
    expect(res.status).toBe(400);
  });
});

// ─── POST /working_hours ──────────────────────────────────────────────────────

describe("POST /working_hours", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).post("/working_hours").send(replaceBody);
    expect(res.status).toBe(401);
  });

  it("returns 403 when authenticated as USER role", async () => {
    const res = await request(app)
      .post("/working_hours")
      .set("Authorization", `Bearer ${userToken()}`)
      .send(replaceBody);
    expect(res.status).toBe(403);
  });

  it("returns 201 with replaced working hours when ADMIN", async () => {
    (workingHoursService.replaceWorkingHours as Mock).mockResolvedValue(mockWorkingHours);

    const res = await request(app)
      .post("/working_hours")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send(replaceBody);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(mockWorkingHours);
  });

  it("returns 400 on missing required fields", async () => {
    const res = await request(app)
      .post("/working_hours")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ master_id: 1 }); // missing records

    expect(res.status).toBe(400);
  });

  it("returns 400 on invalid time format in records", async () => {
    const res = await request(app)
      .post("/working_hours")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({
        master_id: 1,
        records: [{ day_of_week: 1, start_time: "9:00", end_time: "18:00" }], // invalid HH:MM
      });

    expect(res.status).toBe(400);
  });

  it("returns 201 with empty array when records is empty", async () => {
    (workingHoursService.replaceWorkingHours as Mock).mockResolvedValue([]);

    const res = await request(app)
      .post("/working_hours")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ master_id: 1, records: [] });

    expect(res.status).toBe(201);
    expect(res.body).toEqual([]);
  });
});

// ─── DELETE /working_hours ────────────────────────────────────────────────────

describe("DELETE /working_hours", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).delete("/working_hours").query({ master_id: "1" });
    expect(res.status).toBe(401);
  });

  it("returns 403 when authenticated as USER role", async () => {
    const res = await request(app)
      .delete("/working_hours")
      .set("Authorization", `Bearer ${userToken()}`)
      .query({ master_id: "1" });
    expect(res.status).toBe(403);
  });

  it("returns 204 when ADMIN deletes working hours", async () => {
    (workingHoursService.deleteWorkingHoursByMaster as Mock).mockResolvedValue(true);

    const res = await request(app)
      .delete("/working_hours")
      .set("Authorization", `Bearer ${adminToken()}`)
      .query({ master_id: "1" });

    expect(res.status).toBe(204);
  });

  it("returns 400 when master_id is missing", async () => {
    const res = await request(app).delete("/working_hours").set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(400);
  });

  it("returns 400 when master_id is not a number", async () => {
    const res = await request(app)
      .delete("/working_hours")
      .set("Authorization", `Bearer ${adminToken()}`)
      .query({ master_id: "abc" });
    expect(res.status).toBe(400);
  });
});
