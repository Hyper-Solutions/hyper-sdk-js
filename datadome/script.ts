/**
 * A challenge page loads its bundle with the only deferred `<script>` tag on
 * the page, so the bundle is the src of the first tag carrying a defer
 * attribute. The file name is not checked: DataDome renames the bundle freely,
 * e.g. `interstitial.1.36.0.js` or
 * `captcha.build623.01-c-v1.38.0-2026-11-17-05h07.js`. The `c.js` and `i.js`
 * loaders are not deferred and never match.
 */
const scriptTagRegex = /<script\b([^>]*)>/gi;
const deferAttrRegex = /(?:^|\s)defer(?:\s|=|\/|$)/i;
const srcAttrRegex = /(?:^|\s)src\s*=\s*["']([^"']+)["']/i;

/**
 * Returns the challenge bundle URL that a device check or captcha page loads
 * with a `<script defer src="...">` tag, or `null` when the page does not use
 * one.
 *
 * DataDome serves some challenge pages with the bundle inlined in the HTML and
 * others with it in its own file, switching between the two per request, so
 * this has to be checked on every challenge rather than configured once.
 *
 * When it returns a URL, GET it with the same client, proxy and headers you
 * used for the challenge page, and pass the response body as the `script`
 * argument of {@link InterstitialInput} or {@link SliderInput}. When it returns
 * `null` the bundle is already in the HTML and `script` stays undefined.
 *
 * The SDK never fetches the bundle itself.
 *
 * @param html The response body obtained from doing a GET request to the device check URL.
 *
 * @example
 * ```typescript
 * const deviceUrl = parseInterstitialDeviceCheckUrl(body, datadomeCookie, refererUrl);
 * const html = await (await fetch(deviceUrl)).text();
 *
 * let script: string | undefined;
 * const scriptUrl = parseChallengeScriptUrl(html);
 * if (scriptUrl !== null) {
 *     script = await (await fetch(scriptUrl)).text();
 * }
 *
 * const result = await generateInterstitialPayload(session, new InterstitialInput(
 *     userAgent, deviceUrl, html, ip, acceptLanguage, script
 * ));
 * ```
 */
export function parseChallengeScriptUrl(html: string): string | null {
    for (const tag of html.matchAll(scriptTagRegex)) {
        const attrs = tag[1] ?? "";
        if (!deferAttrRegex.test(attrs)) {
            continue;
        }
        const src = srcAttrRegex.exec(attrs);
        if (src != null && src[1] != null) {
            return src[1];
        }
    }

    return null;
}
