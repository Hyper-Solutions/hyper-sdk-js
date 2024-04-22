/**
 * Parses the Akamai Bot Manager web SDK path from the given HTML source code.
 * Returns `null` if the path can't be found.
 * @param src The HTML source code
 */
export function parseAkamaiPath(src: string): string | null {
    const result = /<script type="text\/javascript"\s*(?:nonce=".*?")?\s*src="([a-z\d/\-_]+)"><\/script>/i.exec(src);
    return result?.[1] ?? null;
}
