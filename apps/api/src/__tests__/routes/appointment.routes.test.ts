import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import request from "supertest";

// ─── Mock db and service layer ────────────────────────────────────────────────

vi.mock("../../lib/db", () => ({ knex: vi.fn() }));
vi.mock("../../services/appointmentService");

// ─── Imports ──────────────────────────────────────────────────────────────────

import app from "../../app";
import * as appointmentService from "../../services/appointmentService";
import { generateToken } from "../../services/authService";

// ─── Fixtures & helpers ───────────────────────────────────────────────────────

const mockAppointment = {
  id: 1,
  master_id: 1,
  user_id: null,
  guest_name: "John Doe",
  guest_phone: "+1234567890",
  date: "2026-04-15",
  time: "10:00:00",
  duration_minutes: 60,
  services: "Manicure",
  comments: null,
  status: "new",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function adminToken() {
  return generateToken({ id: "uuid-admin", email: "admin@example.com", role: "ADMIN" });
}

const createBody = {
  master_id: 1,
  guest_name: "John Doe",
  guest_phone: "+1234567890",
  date: "2026-04-15",
  time: "10:00",
  duration_minutes: 60,
};

// ─── GET /appointment/slots/available ────────────────────────────────────────

describe("GET /appointment/slots/available", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with availability result (public route)", async () => {
    (appointmentService.checkAvailability as Mock).mockResolvedValue({
      available: true,
      slot: { date: "2026-04-15", time: "10:00" },
    });

    const res = await request(app)
      .get("/appointment/slots/available")
      .query({ masterId: "1", date: "2026-04-15", time: "10:00", duration: "60" });

    expect(res.status).toBe(200);
    expect(res.body.available).toBe(true);
  });

  it("returns 400 when required query params are missing", async () => {
    const res = await request(app).get("/appointment/slots/available").query({ masterId: "1" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when masterId is not a number", async () => {
    const res = await request(app)
      .get("/appointment/slots/available")
      .query({ masterId: "abc", date: "2026-04-15", time: "10:00", duration: "60" });
    expect(res.status).toBe(400);
  });
});

// ─── GET /appointment/suggestions ────────────────────────────────────────────

describe("GET /appointment/suggestions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 and suggestions (public route)", async () => {
    (appointmentService.getSuggestionsByMaster as Mock).mockResolvedValue([
      { master: { id: 1, name: "Jane" }, slots: [] },
    ]);

    const res = await request(app).get("/appointment/suggestions");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns 400 when masterId is not a number", async () => {
    const res = await request(app).get("/appointment/suggestions").query({ masterId: "abc" });
    expect(res.status).toBe(400);
  });
});

// ─── GET /appointment/master/:masterId ───────────────────────────────────────

describe("GET /appointment/master/:masterId", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 and appointments (public route)", async () => {
    (appointmentService.getAppointmentsForMaster as Mock).mockResolvedValue([mockAppointment]);

    const res = await request(app).get("/appointment/master/1").query({ from: "2026-04-01", to: "2026-04-30" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockAppointment]);
  });

  it("returns 400 when from/to are missing", async () => {
    const res = await request(app).get("/appointment/master/1");
    expect(res.status).toBe(400);
  });

  it("returns 400 when masterId is not a number", async () => {
    const res = await request(app).get("/appointment/master/abc").query({ from: "2026-04-01", to: "2026-04-30" });
    expect(res.status).toBe(400);
  });
});

// ─── GET /appointment/master/:masterId/slots ─────────────────────────────────

describe("GET /appointment/master/:masterId/slots", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/appointment/master/1/slots").query({ from: "2026-04-01", to: "2026-04-07" });
    expect(res.status).toBe(401);
  });

  it("returns 200 when ADMIN provides valid params", async () => {
    (appointmentService.getSlotsMap as Mock).mockResolvedValue([]);

    const res = await request(app)
      .get("/appointment/master/1/slots")
      .set("Authorization", `Bearer ${adminToken()}`)
      .query({ from: "2026-04-01", to: "2026-04-07" });

    expect(res.status).toBe(200);
  });

  it("returns 400 when from/to are missing", async () => {
    const res = await request(app).get("/appointment/master/1/slots").set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(400);
  });
});

// ─── GET /appointment/master/:masterId/empty_slots ───────────────────────────

describe("GET /appointment/master/:masterId/empty_slots", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 for public route with valid params", async () => {
    (appointmentService.getSlotsMap as Mock).mockResolvedValue([]);

    const res = await request(app)
      .get("/appointment/master/1/empty_slots")
      .query({ from: "2026-04-01", to: "2026-04-07" });

    expect(res.status).toBe(200);
  });

  it("returns 400 when from/to are missing", async () => {
    const res = await request(app).get("/appointment/master/1/empty_slots");
    expect(res.status).toBe(400);
  });
});

// ─── POST /appointment ────────────────────────────────────────────────────────

describe("POST /appointment", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 201 and created appointment (public route)", async () => {
    (appointmentService.createAppointment as Mock).mockResolvedValue(mockAppointment);

    const res = await request(app).post("/appointment").send(createBody);

    expect(res.status).toBe(201);
    expect(res.body.guest_name).toBe(mockAppointment.guest_name);
  });

  it("returns 400 on missing required fields", async () => {
    const res = await request(app).post("/appointment").send({ master_id: 1 });
    expect(res.status).toBe(400);
  });

  it("returns 400 on invalid date format", async () => {
    const res = await request(app)
      .post("/appointment")
      .send({ ...createBody, date: "15-04-2026" });
    expect(res.status).toBe(400);
  });

  it("returns 409 when slot is unavailable", async () => {
    (appointmentService.createAppointment as Mock).mockRejectedValue(new Error("SLOT_UNAVAILABLE"));

    const res = await request(app).post("/appointment").send(createBody);

    expect(res.status).toBe(409);
  });
});

// ─── PUT /appointment/:id/reschedule ─────────────────────────────────────────

describe("PUT /appointment/:id/reschedule", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).put("/appointment/1/reschedule").send({ date: "2026-04-20", time: "11:00" });
    expect(res.status).toBe(401);
  });

  it("returns 200 and rescheduled appointment when ADMIN", async () => {
    const rescheduled = { ...mockAppointment, date: "2026-04-20", time: "11:00:00" };
    (appointmentService.rescheduleAppointment as Mock).mockResolvedValue(rescheduled);

    const res = await request(app)
      .put("/appointment/1/reschedule")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ date: "2026-04-20", time: "11:00" });

    expect(res.status).toBe(200);
    expect(res.body.date).toBe("2026-04-20");
  });

  it("returns 400 on missing required reschedule fields", async () => {
    const res = await request(app)
      .put("/appointment/1/reschedule")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ date: "2026-04-20" }); // missing time

    expect(res.status).toBe(400);
  });

  it("returns 404 when appointment does not exist", async () => {
    (appointmentService.rescheduleAppointment as Mock).mockRejectedValue(new Error("APPOINTMENT_NOT_FOUND"));

    const res = await request(app)
      .put("/appointment/999/reschedule")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ date: "2026-04-20", time: "11:00" });

    expect(res.status).toBe(404);
  });

  it("returns 409 when slot is unavailable for reschedule", async () => {
    (appointmentService.rescheduleAppointment as Mock).mockRejectedValue(new Error("SLOT_UNAVAILABLE"));

    const res = await request(app)
      .put("/appointment/1/reschedule")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ date: "2026-04-20", time: "11:00" });

    expect(res.status).toBe(409);
  });
});

// ─── PUT /appointment/:id ─────────────────────────────────────────────────────

describe("PUT /appointment/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).put("/appointment/1").send({ status: "confirmed" });
    expect(res.status).toBe(401);
  });

  it("returns 200 and updated appointment when ADMIN", async () => {
    const updated = { ...mockAppointment, status: "confirmed" };
    (appointmentService.updateAppointment as Mock).mockResolvedValue(updated);

    const res = await request(app)
      .put("/appointment/1")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ status: "confirmed" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("confirmed");
  });

  it("returns 400 on invalid status value", async () => {
    const res = await request(app)
      .put("/appointment/1")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ status: "invalid_status" });

    expect(res.status).toBe(400);
  });

  it("returns 404 when appointment does not exist", async () => {
    (appointmentService.updateAppointment as Mock).mockResolvedValue(null);

    const res = await request(app)
      .put("/appointment/999")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ status: "confirmed" });

    expect(res.status).toBe(404);
  });
});

// ─── DELETE /appointment/:id ──────────────────────────────────────────────────

describe("DELETE /appointment/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 204 when appointment deleted (public route)", async () => {
    (appointmentService.deleteAppointment as Mock).mockResolvedValue(true);

    const res = await request(app).delete("/appointment/1");

    expect(res.status).toBe(204);
  });

  it("returns 404 when appointment does not exist", async () => {
    (appointmentService.deleteAppointment as Mock).mockResolvedValue(false);

    const res = await request(app).delete("/appointment/999");

    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid (non-numeric) id", async () => {
    const res = await request(app).delete("/appointment/abc");
    expect(res.status).toBe(400);
  });
});

// ─── PATCH /appointment/:id ───────────────────────────────────────────────────

describe("PATCH /appointment/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 and updated appointment when comment is provided", async () => {
    const updated = { ...mockAppointment, comments: "Please use gel polish" };
    (appointmentService.updateAppointmentComment as Mock).mockResolvedValue(updated);

    const res = await request(app).patch("/appointment/1").send({ comments: "Please use gel polish" });

    expect(res.status).toBe(200);
    expect(res.body.comments).toBe("Please use gel polish");
  });

  it("returns 200 when comment is set to null", async () => {
    const updated = { ...mockAppointment, comments: null };
    (appointmentService.updateAppointmentComment as Mock).mockResolvedValue(updated);

    const res = await request(app).patch("/appointment/1").send({ comments: null });

    expect(res.status).toBe(200);
  });

  it("returns 400 when comments field is missing", async () => {
    const res = await request(app).patch("/appointment/1").send({});
    expect(res.status).toBe(400);
  });

  it("returns 404 when appointment does not exist", async () => {
    (appointmentService.updateAppointmentComment as Mock).mockResolvedValue(null);

    const res = await request(app).patch("/appointment/999").send({ comments: "test" });

    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid (non-numeric) id", async () => {
    const res = await request(app).patch("/appointment/abc").send({ comments: "test" });
    expect(res.status).toBe(400);
  });
});

// ─── GET /appointment/user/:userId ────────────────────────────────────────────

describe("GET /appointment/user/:userId", () => {
  beforeEach(() => vi.clearAllMocks());

  const mockPaginatedResult = {
    data: [
      {
        ...mockAppointment,
        master_data: { id: 1, name: "Jane Smith", description: null },
      },
    ],
    pagination: {
      currentPage: 1,
      perPage: 10,
      from: 1,
      to: 1,
      total: 1,
      lastPage: 1,
      prevPage: 0,
      nextPage: 2,
    },
  };

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/appointment/user/550e8400-e29b-41d4-a716-446655440001");
    expect(res.status).toBe(401);
  });

  it("returns 200 with paginated appointments when authenticated", async () => {
    (appointmentService.getAppointmentsByUserId as Mock).mockResolvedValue(mockPaginatedResult);

    const res = await request(app)
      .get("/appointment/user/550e8400-e29b-41d4-a716-446655440001")
      .set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].master_data).toEqual({ id: 1, name: "Jane Smith", description: null });
    expect(res.body.pagination.total).toBe(1);
  });

  it("returns 200 with from/to filters", async () => {
    (appointmentService.getAppointmentsByUserId as Mock).mockResolvedValue(mockPaginatedResult);

    const res = await request(app)
      .get("/appointment/user/550e8400-e29b-41d4-a716-446655440001")
      .set("Authorization", `Bearer ${adminToken()}`)
      .query({ from: "2026-01-01", to: "2026-12-31", page: "1", perPage: "5" });

    expect(res.status).toBe(200);
    expect(appointmentService.getAppointmentsByUserId).toHaveBeenCalledWith(
      expect.objectContaining({ from: "2026-01-01", to: "2026-12-31", page: 1, perPage: 5 })
    );
  });

  it("returns 400 when page is invalid", async () => {
    const res = await request(app)
      .get("/appointment/user/550e8400-e29b-41d4-a716-446655440001")
      .set("Authorization", `Bearer ${adminToken()}`)
      .query({ page: "abc" });

    expect(res.status).toBe(400);
  });
});
