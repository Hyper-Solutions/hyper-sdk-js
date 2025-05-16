import assert from "assert";
import {Session} from "../index";
import {IApiResponse, InvalidApiResponseError, sendRequest} from "./api";
import * as rm from "typed-rest-client/RestClient";
import {IHeaders} from "typed-rest-client/Interfaces";

const scriptRegex = new RegExp(`src="(/_Incapsula_Resource\?[^"]*)"`);

/**
 * Parses the utmvc script path from the given HTML input.
 * @param input The HTML page
 */
export function parseUtmvcScriptPath(input: string): string | null {
    const result = scriptRegex.exec(input);
    if (result == null || result.length < 2) {
        return null;
    }

    return result[1];
}

/**
 * Generates a script path to post the generated `___utmvc` cookie to.
 */
export function generateUtmvcScriptPath(): string {
    return `/_Incapsula_Resource?SWKMTFSR=1&e=${Math.random()}`;
}

/**
 * Checks if the given HTTP cookie name is a session cookie.
 * This can be used to extract session cookies for use with {@link generateUtmvcCookie}.
 *
 * Callers should use {@link getSessionIds} instead if possible.
 * @param name The name of the cookie
 * @returns {boolean} If the given cookie name is a session cookie
 */
export function isSessionCookie(name: string): boolean {
    return name.startsWith("incap_ses_");
}

/**
 * An HTTP cookie.
 */
export interface Cookie {
    /**
     * The cookie's name.
     */
    readonly name: string;

    /**
     * The cookie's value.
     */
    readonly value: string;
}

/**
 * Extracts session cookie values from the given cookies.
 * @param cookies Cookies to extract session cookies from
 * @returns {string[]} Session cookie values
 */
export function getSessionIds(cookies: Cookie[]): string[] {
    return cookies
        .filter(cookie => isSessionCookie(cookie.name))
        .map(cookie => cookie.value)
    ;
}

/**
 * Utmvc API input.
 */
export class UtmvcInput {
    readonly userAgent: string;
    readonly script: string;
    readonly sessionIds: string[];

    /**
     * Creates a new instance.
     * @param userAgent The user agent to impersonate
     * @param script The Incapsula utmvc JavaScript code
     * @param sessionIds The session ID's. Read the
     *        {@link https://docs.justhyped.dev/incapsula/api-reference|documentation} for more information.
     *        Callers can use {@link getSessionIds} or {@link isSessionCookie} to assist with extracting
     *        session cookies from their cookie jar.
     */
    public constructor(userAgent: string, script: string, sessionIds: string[]) {
        assert(userAgent.length > 0, "userAgent must be a non-empty string");
        assert(script.length > 0, "script must be a non-empty string");

        this.userAgent = userAgent;
        this.script = script;
        this.sessionIds = sessionIds;
    }
}

/**
 * Generates a `___utmvc` cookie.
 * @param session The {@link Session}
 * @param input The {@link UtmvcInput}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain a `___utmvc` cookie
 */
export async function generateUtmvcCookie(session: Session, input: UtmvcInput): Promise<{payload: string, swhanedl: string}> {
    // Create request headers
    const headers: IHeaders = {
        "Content-Type": "application/json",
        "X-Api-Key": session.apiKey
    };
    if (session.jwtKey != undefined && session.jwtKey.length > 0) {
        headers["X-Signature"] = session.generateSignature();
    }

    // Execute request
    const response: rm.IRestResponse<IApiResponse> = await session.client.create("https://incapsula.justhyped.dev/utmvc", input, {
        acceptHeader: "application/json",
        additionalHeaders: headers
    });

    // Validate response and return
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
    if (response.result.swhanedl == undefined) {
        throw new InvalidApiResponseError("No swhanedl obtained from API");
    }

    return {
        payload: response.result.payload,
        swhanedl: response.result.swhanedl
    };
}