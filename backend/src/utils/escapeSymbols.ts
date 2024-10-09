export function escapeSymbols(text: string): string {
    const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];

    return text
        .split('')
        .map((char) => (specialChars.includes(char) ? `\\${char}` : char))
        .join('')
        .replace(/\\`\\`\\`/gm, '```');
}
