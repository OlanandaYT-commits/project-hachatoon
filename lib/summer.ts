export function summerEnd(now: Date): Date {
  return new Date(now.getFullYear(), 7, 31, 23, 59, 59);
}

export function isSummerOver(now: Date): boolean {
  return now.getTime() > summerEnd(now).getTime();
}

export function weekendsLeft(now: Date): number {
  const end = summerEnd(now);
  if (now.getTime() > end.getTime()) return 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let count = 0;
  while (cursor.getTime() <= end.getTime()) {
    const day = cursor.getDay();
    if (day === 0 || day === 6) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function timeLeft(now: Date): { days: number; hours: number; mins: number; secs: number } {
  const end = summerEnd(now);
  let diff = Math.max(0, end.getTime() - now.getTime());
  const days = Math.floor(diff / 86400000);
  diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000);
  diff -= hours * 3600000;
  const mins = Math.floor(diff / 60000);
  diff -= mins * 60000;
  const secs = Math.floor(diff / 1000);
  return { days, hours, mins, secs };
}
