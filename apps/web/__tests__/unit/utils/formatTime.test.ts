import { formatTimeToHHMM } from "@/utils/formatTime";

describe("formatTimeToHHMM", () => {
  it("returns HH:MM from HH:MM:SS", () => {
    expect(formatTimeToHHMM("14:30:00")).toBe("14:30");
  });

  it("returns HH:MM when already in HH:MM format", () => {
    expect(formatTimeToHHMM("09:05")).toBe("09:05");
  });

  it("returns empty string for empty input", () => {
    expect(formatTimeToHHMM("")).toBe("");
  });
});
