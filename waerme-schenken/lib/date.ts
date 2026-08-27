const ZURICH_TZ = 'Europe/Zurich';

/** Format a date in Zurich local time using de-CH conventions. */
export function formatZurichDate(date: Date | string, opts: Intl.DateTimeFormatOptions = {}): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('de-CH', { ...opts, timeZone: ZURICH_TZ });
}

/** Extract the Y-M-D Zurich-local calendar day, for seeding <input type="date"> values. */
export function toZurichDateInputValue(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('sv-SE', { timeZone: ZURICH_TZ }).split(' ')[0];
}
