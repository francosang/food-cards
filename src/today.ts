/**
 * Local date as `YYYY-MM-DD`, the key of a Day.
 * Ticket 04 replaces the direct `new Date()` in the app with an injectable clock.
 */
export function localDate(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
