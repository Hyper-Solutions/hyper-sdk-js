/**
 * Matches the tag a challenge page uses to load the bundle from
 * ct.captcha-delivery.com, capturing the URL. The name in front of the version
 * is left open so it keeps matching whatever DataDome calls the bundle, e.g.
 * `interstitial.1.33.0.202609141.js` or `captcha.1.34.0.202609141.js`.
 */
const challengeScriptRegex = /<script[^>]+src\s*=\s*["']([^"']*\/[a-z_-]+\.\d+\.\d+\.\d+\.[^"']*\.js)["']/;

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
    const matches = challengeScriptRegex.exec(html);
    if (matches == null || matches.length !== 2 || matches[1] == null) {
        return null;
    }

    return matches[1];
}
