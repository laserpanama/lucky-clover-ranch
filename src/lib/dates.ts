/** Parse an ISO date string as a local-timezone date, avoiding UTC shift. */
export function localDate(s: string): Date {
  return new Date(s.includes("T") ? s : s + "T00:00:00");
}

/** Strip the time portion from an ISO string, returning YYYY-MM-DD. */
export function toDateInput(s: string): string {
  return s.split("T")[0];
}

/** Return a new Date set to the start of today (midnight). */
export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
