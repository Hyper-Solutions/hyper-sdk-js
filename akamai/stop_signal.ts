/**
 * Determines if the provided `_abck` cookie value is valid, based on Akamai Bot Manager's client-side stop signal
 * mechanism using the given request count. If the result is true, the client is ADVISED to halt further
 * sensor data submissions. Submitting further would still produce a valid cookie but is unnecessary.
 *
 * The stop signal mechanism in the Akamai Bot Manager's client-side script informs a client that the cookie
 * received is valid and that any additional submissions are superfluous.
 * @param cookie The _abck cookie value
 * @param requestCount The number of requests made
 */
export function isAkamaiCookieValid(cookie: string, requestCount: number): boolean {
    const parts = cookie.split("~");
    if (parts.length < 2) {
        return false;
    }

    let requestThreshold = parseInt(parts[1]);
    // Note: this is not the same as:
    // parseInt(parts[1]) || -1
    // as parts[1] can be zero (and is commonly).
    if (isNaN(requestThreshold)) {
        requestThreshold = -1;
    }

    return requestThreshold != -1 && requestCount >= requestThreshold;
}

/**
 * Determines if the current session requires more sensors to be sent.
 *
 * Protected endpoints can invalidate a session by setting a new `_abck` cookie that ends in `~0~-1~-1` or similar.
 * This function reports if such an invalidated cookie is present. If present, you should be able to make the
 * cookie valid again with only one sensor post.
 * @param cookie The _abck cookie value
 * @returns {boolean} If the cookie is invalidated
 */
export function isAkamaiCookieInvalidated(cookie: string): boolean {
    const parts = cookie.split("~");
    if (parts.length < 4) {
        return false;
    }

    // Note: NaN being returned from parseInt doesn't matter since NaN > -1 == false
    return parseInt(parts[3]) > -1;
}
