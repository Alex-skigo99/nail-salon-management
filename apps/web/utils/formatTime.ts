/**
 * Formats time string to HH:MM format (removes seconds)
 * @param time - Time string in HH:MM or HH:MM:SS format
 * @returns Time string in HH:MM format
 */
export function formatTimeToHHMM(time: string): string {
  if (!time) return "";
  // Take only the first 5 characters (HH:MM)
  return time.slice(0, 5);
}
