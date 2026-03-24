import {
  getWeekStart,
  getWeekEnd,
  formatDate,
  formatShortDate,
  formatWeekRange,
  formatMonthYear,
  getMonthStart,
  getMonthEnd,
  getMonthWeeks,
  getWeekDays,
  isSameDay,
  parseLocalDate,
  formatDateForInput,
  shiftDate,
  getDaysToGo,
} from "@/utils/dateUtils";

describe("getWeekStart", () => {
  it("returns the Sunday of the current week", () => {
    const wednesday = new Date("2026-03-18"); // Wednesday
    const start = getWeekStart(wednesday);
    expect(start.getDay()).toBe(0); // Sunday
    expect(formatDate(start)).toBe("2026-03-15");
  });

  it("returns the same day when already Sunday", () => {
    const sunday = new Date("2026-03-15");
    const start = getWeekStart(sunday);
    expect(formatDate(start)).toBe("2026-03-15");
  });
});

describe("getWeekEnd", () => {
  it("returns the Saturday of the current week", () => {
    const wednesday = new Date("2026-03-18");
    const end = getWeekEnd(wednesday);
    expect(end.getDay()).toBe(6); // Saturday
    expect(formatDate(end)).toBe("2026-03-21");
  });
});

describe("formatDate", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(formatDate(new Date("2026-01-05"))).toBe("2026-01-05");
  });

  it("pads single-digit month and day with zeros", () => {
    expect(formatDate(new Date("2026-03-09"))).toBe("2026-03-09");
  });
});

describe("formatShortDate", () => {
  it("returns short month and day by default", () => {
    const result = formatShortDate(new Date("2026-03-09"));
    expect(result).toBe("Mar 9");
  });

  it("returns long month when requested", () => {
    const result = formatShortDate(new Date("2026-03-09"), "long");
    expect(result).toBe("March 9");
  });
});

describe("formatWeekRange", () => {
  it("formats a week range correctly", () => {
    const start = new Date("2026-03-15");
    const end = new Date("2026-03-21");
    const result = formatWeekRange(start, end);
    expect(result).toBe("Mar 15 – Mar 21, 2026");
  });
});

describe("formatMonthYear", () => {
  it("formats month and year", () => {
    expect(formatMonthYear(new Date("2026-03-09"))).toBe("March 2026");
  });
});

describe("month helpers", () => {
  it("returns month start and end", () => {
    const d = new Date("2026-03-18");
    expect(formatDate(getMonthStart(d))).toBe("2026-03-01");
    expect(formatDate(getMonthEnd(d))).toBe("2026-03-31");
  });

  it("returns all weeks that overlap the month", () => {
    const weeks = getMonthWeeks(new Date("2026-03-15"));
    expect(weeks).toHaveLength(5);
    expect(formatDate(weeks[0].start)).toBe("2026-03-01");
    expect(formatDate(weeks[4].start)).toBe("2026-03-29");
    expect(formatDate(weeks[4].end)).toBe("2026-04-04");
  });
});

describe("getWeekDays", () => {
  it("returns seven sequential days for a week start", () => {
    const start = new Date("2026-03-15");
    const days = getWeekDays(start);
    expect(days).toHaveLength(7);
    const formatted = days.map(formatDate).join(",");
    expect(formatted).toBe("2026-03-15,2026-03-16,2026-03-17,2026-03-18,2026-03-19,2026-03-20,2026-03-21");
  });
});

describe("isSameDay", () => {
  it("returns true for same calendar day regardless of time", () => {
    const a = new Date("2026-03-09T10:00:00");
    const b = new Date("2026-03-09T23:59:59");
    expect(isSameDay(a, b)).toBe(true);
  });

  it("returns false for different days", () => {
    const a = new Date("2026-03-09");
    const b = new Date("2026-03-10");
    expect(isSameDay(a, b)).toBe(false);
  });
});

describe("parseLocalDate", () => {
  it("parses YYYY-MM-DD into local Date", () => {
    const d = parseLocalDate("2026-03-09");
    expect(formatDate(d)).toBe("2026-03-09");
  });
});

describe("formatDateForInput", () => {
  it("returns YYYY-MM-DD unchanged", () => {
    expect(formatDateForInput("2026-03-09")).toBe("2026-03-09");
  });

  it("parses and reformats a verbose date string", () => {
    expect(formatDateForInput("March 9, 2026")).toBe("2026-03-09");
  });
});

describe("shiftDate", () => {
  it("shifts a date string by the given number of days", () => {
    expect(shiftDate("2026-03-09", 2)).toBe("2026-03-11");
  });
});

describe("getDaysToGo", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-24T12:00:00Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("returns 0 for past in UTC but today in local time", () => {
    expect(getDaysToGo("2026-03-23T22:00:00Z", "15:00")).toBe(0);
  });

  it("returns 0 for today in this time", () => {
    expect(getDaysToGo("2026-03-24T00:00:00Z", "14:00")).toBe(0);
  });

  it("returns positive for future date", () => {
    expect(getDaysToGo("2026-03-25T00:00:00Z", "12:00")).toBe(1);
  });

  it("returns negative for past date", () => {
    expect(getDaysToGo("2026-03-22T00:00:00Z", "12:00")).toBe(-2);
  });

  it("returns negative for today in the past time", () => {
    expect(getDaysToGo("2026-03-24T00:00:00Z", "09:00")).toBe(-1);
  });
});
