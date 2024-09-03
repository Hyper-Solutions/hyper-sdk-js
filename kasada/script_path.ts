/**
 * Parses the Kasada ips.js path from the given HTML source code.
 * Returns `null` if the path can't be found.
 * Replaces &amp; with & in the result.
 * @param src The HTML source code
 */
export function parseKasadaPath(src: string): string | null {
    const scriptPathExpr = /<script\s+src="([^"]+)"/;
    const result = scriptPathExpr.exec(src);
    if (result?.[1]) {
        return result[1].replace(/&amp;/g, '&');
    }
    return null;
}