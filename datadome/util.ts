/**
 * Parses `var dd = {...};` as a JSON object.
 *
 * Note: NOT A PUBLIC API.
 * @param body Response body
 */
export function parseObject(body: string): any | null {
    let result = /var\s+dd\s*=\s*(\{\s*([\s\S]*?)\s*})/.exec(body);
    if (result == null || result.length < 2) {
        return null;
    }

    let raw = result[1].replace(/'([^']*)'/g, `"$1"`);
    raw = raw.replace(/([^"]|^)(\b\w+)\s*: /g, `$1"$2":`);

    return JSON.parse(raw);
}
