import { getWeekStart, getWeekEnd, formatDate, formatShortDate, formatWeekRange } from "@/utils/dateUtils";

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
