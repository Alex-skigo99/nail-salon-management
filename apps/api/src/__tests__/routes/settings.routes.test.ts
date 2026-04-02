import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import request from "supertest";

// ─── Mock db and service layer ────────────────────────────────────────────────

vi.mock("../../lib/db", () => ({ knex: vi.fn() }));
vi.mock("../../services/settingsService");

// ─── Imports ──────────────────────────────────────────────────────────────────

import app from "../../app";
import * as settingsService from "../../services/settingsService";
import { generateToken } from "../../services/authService";

// ─── Fixtures & helpers ───────────────────────────────────────────────────────

const mockSetting = {
  id: 1,
  key: "slot_duration",
  value: "30",
  description: "Duration of a single time slot in minutes",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockBookingPeriod = {
  id: 2,
  key: "booking_period",
  value: "30",
  description: "Number of days forward clients can schedule appointments",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function adminToken() {
  return generateToken({ id: "uuid-admin", email: "admin@example.com", role: "ADMIN" });
}

function userToken() {
  return generateToken({ id: "uuid-user", email: "user@example.com", role: "USER" });
}

// ─── GET /settings ────────────────────────────────────────────────────────────

describe("GET /settings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 and all settings when no key query (public route)", async () => {
    (settingsService.getAllSettings as Mock).mockResolvedValue([mockSetting, mockBookingPeriod]);

    const res = await request(app).get("/settings");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockSetting, mockBookingPeriod]);
  });

  it("returns 200 and single setting when key query is provided", async () => {
    (settingsService.getSettingByKey as Mock).mockResolvedValue(mockSetting);

    const res = await request(app).get("/settings?key=slot_duration");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockSetting);
  });

  it("returns 404 when key is not found", async () => {
    (settingsService.getSettingByKey as Mock).mockResolvedValue(undefined);

    const res = await request(app).get("/settings?key=nonexistent");

    expect(res.status).toBe(404);
  });
});

// ─── PATCH /settings/:key ─────────────────────────────────────────────────────

describe("PATCH /settings/:key", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).patch("/settings/slot_duration").send({ value: "45" });
    expect(res.status).toBe(401);
  });

  it("returns 403 when authenticated as USER role", async () => {
    const res = await request(app)
      .patch("/settings/slot_duration")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ value: "45" });
    expect(res.status).toBe(403);
  });

  it("returns 200 and updated setting when ADMIN updates", async () => {
    const updated = { ...mockSetting, value: "45" };
    (settingsService.updateSetting as Mock).mockResolvedValue(updated);

    const res = await request(app)
      .patch("/settings/slot_duration")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ value: "45" });

    expect(res.status).toBe(200);
    expect(res.body.value).toBe("45");
  });

  it("returns 404 when setting key does not exist", async () => {
    (settingsService.updateSetting as Mock).mockResolvedValue(null);

    const res = await request(app)
      .patch("/settings/nonexistent")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ value: "100" });

    expect(res.status).toBe(404);
  });

  it("returns 400 on missing value field", async () => {
    const res = await request(app)
      .patch("/settings/slot_duration")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 400 on empty value string", async () => {
    const res = await request(app)
      .patch("/settings/slot_duration")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ value: "" });

    expect(res.status).toBe(400);
  });
});
