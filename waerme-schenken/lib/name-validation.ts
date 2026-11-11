// Name checks for the family registration. Families often typed their postcode
// or street into the name fields (phone autofill puts address data there), which
// then ends up on the donor's shipping label.

// Letters of any script (Müller, Đorđević, Ольга, محمد) plus the separators used
// in names: space, hyphen, apostrophe and period. Must start with a letter.
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} '’.\-]*$/u;
const MAX_NAME_LENGTH = 60;

export const NAME_LETTERS_ONLY_MESSAGE = 'Bitte gib nur Buchstaben ein (keine Zahlen).';
export const NAME_LOOKS_LIKE_POSTCODE_MESSAGE =
    'Das sieht nach einer PLZ aus. Die PLZ gibst du im nächsten Schritt ein.';

export function normalizeName(value: unknown): string {
    return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export function isValidPersonName(value: unknown): boolean {
    const name = normalizeName(value);
    return name.length > 0 && name.length <= MAX_NAME_LENGTH && NAME_PATTERN.test(name);
}

/** Returns an error message for a filled-in name, or null if it is fine. */
export function nameError(value: unknown): string | null {
    const name = normalizeName(value);
    if (isValidPersonName(name)) return null;
    return /\d{4}/.test(name) ? NAME_LOOKS_LIKE_POSTCODE_MESSAGE : NAME_LETTERS_ONLY_MESSAGE;
}
