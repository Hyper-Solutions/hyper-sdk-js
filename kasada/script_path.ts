/**
 * Parses the Kasada ips.js path from the given HTML source code.
 * Returns `null` if the path can't be found.
 * @param src The HTML source code
 */
export function parseKasadaPath(src: string): string | null {
    const scriptPathExpr = /<script\s+src="([^"]+)"/;
    const result = scriptPathExpr.exec(src);
    return result?.[1] ?? null;
}