import {generateSignature, Session} from "../index";
import {IHeaders} from "typed-rest-client/Interfaces";
import * as rm from "typed-rest-client";

/**
 * Kasada payload input.
 */
export class KasadaPayloadInput {
    readonly userAgent: string;
    readonly ipsLink: string;
    readonly script: string;
    readonly acceptLanguage: string;
    readonly ip: string;

    /**
     * Creates a new instance.
     * @param userAgent The user agent to impersonate
     * @param ipsLink The ips.js script link, parsed from the block page (429 status code)
     * @param script The ips.js script retrieved using the IpsLink url
     * @param ip The IPV4 address of your network or proxy.
     * @param acceptLanguage Your accept-language header.
     */
    public constructor(userAgent: string, ipsLink: string, script: string, ip: string, acceptLanguage: string) {
        this.userAgent = userAgent;
        this.ipsLink = ipsLink;
        this.script = script;
        this.ip = ip;
        this.acceptLanguage = acceptLanguage;
    }
}

/**
 * Kasada payload output.
 */
export interface KasadaPayloadOutput {
    /**
     * The payload as a string, base64 encoded for easier handling, make sure to POST the decoded bytes to /tl.
     */
    payload: string;

    /**
     * Kasada headers.
     */
    headers: KasadaHeaders;
}

/**
 * API response schema.
 */
interface IApiResponse {
    /**
     * The payload.
     */
    payload?: string;

    /**
     * Kasada headers.
     */
    headers?: KasadaHeaders;

    /**
     * Error message.
     */
    error?: string;
}

/**
 * Kasada headers structure.
 */
interface KasadaHeaders {
    "x-kpsdk-ct": string;
    "x-kpsdk-dt": string;
    "x-kpsdk-v": string;
    "x-kpsdk-r": string;
    "x-kpsdk-dv": string;
    "x-kpsdk-h": string;
    "x-kpsdk-fc": string;
    "x-kpsdk-im": string;
}

/**
 * An invalid API response.
 */
export class InvalidApiResponseError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

/**
 * Generates Kasada payload that can be used to obtain a valid `x-kpsdk-ct` token.
 * @param session The {@link Session}
 * @param input The {@link KasadaPayloadInput}
 * @returns {Promise<KasadaPayloadOutput>} A {@link Promise} that, when resolved, will contain the decoded Kasada /tl payload and headers.
 */
export async function generateKasadaPayload(session: Session, input: KasadaPayloadInput): Promise<KasadaPayloadOutput> {
    const headers: IHeaders = {
        "Content-Type": "application/json",
        "X-Api-Key": session.apiKey
    };
    if (session.jwtKey != undefined && session.jwtKey.length > 0) {
        headers["X-Signature"] = generateSignature(session.apiKey, session.jwtKey);
    }
    if (session.appKey != undefined && session.appKey.length > 0 && session.appSecret != undefined && session.appSecret.length > 0) {
        headers["x-app-signature"] = generateSignature(session.appKey, session.appSecret);
        headers["x-app-key"] = session.appKey;
    }

    // Execute request
    const response: rm.IRestResponse<IApiResponse> = await session.client.create("https://kasada.hypersolutions.co/payload", input, {
        acceptHeader: "application/json",
        additionalHeaders: headers
    });

    // Validate response
    if (response.statusCode != 200) {
        throw new InvalidApiResponseError("Bad HTTP status code " + response.statusCode);
    }
    if (response.result == null) {
        throw new InvalidApiResponseError("Invalid API response");
    }
    if (response.result.error != undefined) {
        throw new InvalidApiResponseError(response.result.error);
    }
    if (response.result.payload == undefined) {
        throw new InvalidApiResponseError("No payload obtained from API");
    }
    if (response.result.headers == undefined) {
        throw new InvalidApiResponseError("No headers obtained from API");
    }

    return {
        payload: response.result.payload,
        headers: response.result.headers
    };
}