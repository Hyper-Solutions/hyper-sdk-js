/**
 * Result types returned by the generate* functions. Each returns an object
 * rather than a string or a positional value, so fields the API adds later
 * become new properties instead of breaking changes.
 */

import type { KasadaHeaders } from "./api-client.js";

/**
 * The Accept-CH client hint headers for the device a payload was generated for,
 * keyed by lowercase header name, values ready to send verbatim (already
 * serialized the way Chrome sends them; do not re-quote).
 *
 * The API returns every hint Chrome sends once a site opts in via Accept-CH:
 * the sec-ch-ua-* family, sec-ch-device-memory, sec-ch-dpr,
 * sec-ch-viewport-width/height, the legacy device-memory, dpr and
 * viewport-width, ect, rtt, downlink and the sec-ch-prefers-* preferences.
 * Send only the ones the site asked for in its Accept-CH response header.
 */
export type ClientHints = Record<string, string>;

/** Returned by {@link generateSensorData}. */
export interface SensorResult {
    /** The sensor data to post. */
    payload: string;
    /** Send back as `context` on the next sensor request. */
    context: string;
    /** Accept-CH headers for the device. Undefined when the API returned none. */
    clientHints?: ClientHints;
}

/** Returned by {@link generateSbsdPayload}. */
export interface SbsdResult {
    /** The sbsd body to post. */
    payload: string;
    /** Send back as `context` on the next sbsd request. */
    context: string;
    /** Accept-CH headers for the device. Undefined when the API returned none. */
    clientHints?: ClientHints;
}

/** Returned by {@link generatePixelData}. */
export interface PixelResult {
    payload: string;
}

/** Returned by {@link generateReese84Sensor}. */
export interface Reese84Result {
    payload: string;
    /** Accept-CH headers for the device. Undefined for Safari user agents. */
    clientHints?: ClientHints;
}

/** Returned by {@link generateUtmvcCookie}. */
export interface UtmvcResult {
    /** The `___utmvc` cookie value. */
    payload: string;
    swhanedl: string | undefined;
}

/** Returned by {@link generateKasadaPayload}. */
export interface KasadaPayloadResult {
    /** The payload, base64 encoded; POST the decoded bytes to /tl. */
    payload: string;
    /** The x-kpsdk-* headers to send with that POST. */
    headers: KasadaHeaders;
    /** Accept-CH headers; unlike `headers`, send only the ones the site asked for. */
    clientHints?: ClientHints;
}

/** Returned by {@link generateKasadaPow}. */
export interface KasadaPowResult {
    /** The x-kpsdk-cd value. */
    payload: string;
}

/** Returned by {@link generateBotIDHeader}. */
export interface BotIDHeaderResult {
    /** The x-is-human header value. */
    payload: string;
}

/** Returned by {@link generateInterstitialPayload}. */
export interface InterstitialResult {
    /** The body to POST to /interstitial/. */
    payload: string;
    /** Accept-CH headers for the device. Undefined when the API returned none. */
    clientHints?: ClientHints;
}

/** Returned by {@link generateSliderPayload}. */
export interface SliderResult {
    /** The URL to GET for a solved datadome cookie. */
    payload: string;
    /** Accept-CH headers for the device. Undefined when the API returned none. */
    clientHints?: ClientHints;
}

/** Returned by {@link generateTagsPayload}. */
export interface TagsResult {
    payload: string;
    /** Accept-CH headers for the device. Undefined when the API returned none. */
    clientHints?: ClientHints;
}
