import { format, addMinutes } from "date-fns";

/**
 * Shared logic to check if a presensi session is currently open.
 * Now supports:
 * 1. Automatic time-based window (today and within start/end time)
 * 2. Forced open by admin (limited to 10 minutes)
 * 3. Manual closure by admin
 */
export function isPresensiOpen(presensi: any) {
  // Guard against undefined/null presensi
  if (!presensi) return false;

  // 1. If explicitly closed by admin (isActive: false)
  if (presensi.isActive === false) return false;

  const now = new Date();

  // 2. If it was forced open by admin (isForcedOpen: true)
  if (presensi.isForcedOpen === true && presensi.forcedOpenAt) {
    const forcedOpenTime = new Date(presensi.forcedOpenAt);
    const expiryTime = addMinutes(forcedOpenTime, 10); // LIMIT: 10 MINUTES

    // Only return true if still within the 10-minute grace period
    if (now <= expiryTime) return true;

    // If we've passed the 10-minute window, it falls back to automatic checks below
    // (Essentially it self-closes the 'Forced' state after 10 mins)
  }

  // 3. Fallback to Automatic timing
  // FORCE WIB (Asia/Jakarta) agar server Vercel yang UTC tetap sinkron dengan HP User
  const nowWIB = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const eventDateWIB = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(presensi.tanggal));

  if (nowWIB !== eventDateWIB) return false;

  // Check time match if date is today
  try {
    const timeFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    
    const [nowH, nowM] = timeFormatter.format(now).split(":").map(Number);
    const [startH, startM] = presensi.jamMulai.split(":").map(Number);
    const [endH, endM] = presensi.jamSelesai.split(":").map(Number);

    const nowTotalMinutes = nowH * 60 + nowM;
    const startTotalMinutes = startH * 60 + startM;
    const endTotalMinutes = endH * 60 + endM;

    return (
      nowTotalMinutes >= startTotalMinutes && nowTotalMinutes <= endTotalMinutes
    );
  } catch {
    return false;
  }
}
