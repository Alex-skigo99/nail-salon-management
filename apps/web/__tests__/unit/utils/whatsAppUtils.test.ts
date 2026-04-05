import {
  buildCreateApptMessage,
  buildSetApptStatusMessage,
  buildDeleteApptMessage,
  buildRescheduleApptMessage,
} from "@/utils/whatsAppUtils";

// getAppointmentDateString uses en-US locale with toLocaleDateString
// "2026-04-10" → "April 10, 2026"
const DATE = "2026-04-10";
const DATE_LABEL = "April 10, 2026";

const OLD_DATE = "2026-04-08";
const OLD_DATE_LABEL = "April 8, 2026";

describe("buildCreateApptMessage", () => {
  const base = { date: DATE, time: "14:00", duration: 60 };

  describe("English (default)", () => {
    it("returns English message without services", () => {
      expect(buildCreateApptMessage(base)).toBe(
        `Hi! Your appointment has been booked for ${DATE_LABEL} at 14:00 (60 min).`
      );
    });

    it("returns English message with services", () => {
      expect(buildCreateApptMessage({ ...base, services: "Manicure" })).toBe(
        `Hi! Your appointment has been booked for ${DATE_LABEL} at 14:00 (60 min).\nServices: Manicure`
      );
    });

    it("uses English for unknown language", () => {
      expect(buildCreateApptMessage(base, "fr")).toBe(
        `Hi! Your appointment has been booked for ${DATE_LABEL} at 14:00 (60 min).`
      );
    });

    it("uses English for null language", () => {
      expect(buildCreateApptMessage(base, null)).toBe(
        `Hi! Your appointment has been booked for ${DATE_LABEL} at 14:00 (60 min).`
      );
    });
  });

  describe("Russian", () => {
    it("returns Russian message without services", () => {
      expect(buildCreateApptMessage(base, "ru")).toBe(
        `Здравствуйте! Ваша запись создана на ${DATE_LABEL} в 14:00 (60 мин).`
      );
    });

    it("returns Russian message with services", () => {
      expect(buildCreateApptMessage({ ...base, services: "Маникюр" }, "ru")).toBe(
        `Здравствуйте! Ваша запись создана на ${DATE_LABEL} в 14:00 (60 мин).\nУслуги: Маникюр`
      );
    });
  });

  describe("Hebrew", () => {
    it("returns Hebrew message without services", () => {
      expect(buildCreateApptMessage(base, "he")).toBe(`שלום! התור שלך נקבע ל-${DATE_LABEL} בשעה 14:00 (60 דקות).`);
    });

    it("returns Hebrew message with services", () => {
      expect(buildCreateApptMessage({ ...base, services: "מניקור" }, "he")).toBe(
        `שלום! התור שלך נקבע ל-${DATE_LABEL} בשעה 14:00 (60 דקות).\nשירותים: מניקור`
      );
    });
  });
});

describe("buildSetApptStatusMessage", () => {
  const base = { date: DATE, time: "14:00", status: "confirmed" };

  it("returns English message by default", () => {
    expect(buildSetApptStatusMessage(base)).toBe(
      `Hi! Your appointment on ${DATE_LABEL} at 14:00 status has been updated to: confirmed.`
    );
  });

  it("returns Russian message", () => {
    expect(buildSetApptStatusMessage(base, "ru")).toBe(
      `Здравствуйте! Статус вашей записи на ${DATE_LABEL} в 14:00 изменён на: confirmed.`
    );
  });

  it("returns Hebrew message", () => {
    expect(buildSetApptStatusMessage(base, "he")).toBe(
      `שלום! סטטוס התור שלך ב-${DATE_LABEL} בשעה 14:00 עודכן ל: confirmed.`
    );
  });

  it("falls back to English for unsupported language", () => {
    expect(buildSetApptStatusMessage(base, "de")).toBe(
      `Hi! Your appointment on ${DATE_LABEL} at 14:00 status has been updated to: confirmed.`
    );
  });
});

describe("buildDeleteApptMessage", () => {
  const base = { date: DATE, time: "14:00" };

  it("returns English message by default", () => {
    expect(buildDeleteApptMessage(base)).toBe(`Hi! Your appointment on ${DATE_LABEL} at 14:00 has been cancelled.`);
  });

  it("returns Russian message", () => {
    expect(buildDeleteApptMessage(base, "ru")).toBe(
      `Здравствуйте! Ваша запись на ${DATE_LABEL} в 14:00 была отменена.`
    );
  });

  it("returns Hebrew message", () => {
    expect(buildDeleteApptMessage(base, "he")).toBe(`שלום! התור שלך ב-${DATE_LABEL} בשעה 14:00 בוטל.`);
  });
});

describe("buildRescheduleApptMessage", () => {
  const base = { oldDate: OLD_DATE, oldTime: "10:00", newDate: DATE, newTime: "14:00" };

  it("returns English message by default", () => {
    expect(buildRescheduleApptMessage(base)).toBe(
      `Hi! Your appointment has been rescheduled from ${OLD_DATE_LABEL} at 10:00 to ${DATE_LABEL} at 14:00.`
    );
  });

  it("returns Russian message", () => {
    expect(buildRescheduleApptMessage(base, "ru")).toBe(
      `Здравствуйте! Ваша запись перенесена с ${OLD_DATE_LABEL} в 10:00 на ${DATE_LABEL} в 14:00.`
    );
  });

  it("returns Hebrew message", () => {
    expect(buildRescheduleApptMessage(base, "he")).toBe(
      `שלום! התור שלך הוזז מ-${OLD_DATE_LABEL} בשעה 10:00 ל-${DATE_LABEL} בשעה 14:00.`
    );
  });

  it("falls back to English for null language", () => {
    expect(buildRescheduleApptMessage(base, null)).toBe(
      `Hi! Your appointment has been rescheduled from ${OLD_DATE_LABEL} at 10:00 to ${DATE_LABEL} at 14:00.`
    );
  });
});
