import {Session} from "../index";
import {IApiResponse, InvalidApiResponseError} from "./api";
import {IHeaders} from "typed-rest-client/Interfaces";
import * as rm from "typed-rest-client";

/**
 * TrustDecision payload generation input.
 */
export class PayloadInput {
    readonly userAgent: string;
    readonly pageUrl: string;
    readonly fpUrl: string;
    readonly ip: string;
    readonly acceptLanguage: string;
    readonly script: string;

    /**
     * Creates a new instance.
     * Refer to the {@link https://docs.justhyped.dev/api-reference/trust-decision|documentation} for more information.
     * @param userAgent The userAgent that you're using for the entire session
     * @param pageUrl The target page URL where TrustDecision protection is active
     * @param fpUrl The td-fp URL where the payload is posted
     * @param ip The IP address that will be used to post the sensor data to the target site
     * @param acceptLanguage Your accept-language header value
     * @param script The TrustDecision fingerprinting script source code obtained from the fm.js endpoint
     */
    public constructor(userAgent: string, pageUrl: string, fpUrl: string, ip: string, acceptLanguage: string, script: string) {
        this.userAgent = userAgent;
        this.pageUrl = pageUrl;
        this.fpUrl = fpUrl;
        this.ip = ip;
        this.acceptLanguage = acceptLanguage;
        this.script = script;
    }
}

/**
 * Generates TrustDecision payload that should be posted to TrustDecision's fingerprinting endpoint.
 * Also returns timezone and clientId required for subsequent operations.
 * @param session The {@link Session}
 * @param input The {@link PayloadInput}
 * @returns {Promise<{payload: string, timeZone: string, clientId: string}>} A {@link Promise} that, when resolved, will contain payload data
 */
export async function generateTrustDecisionPayload(session: Session, input: PayloadInput): Promise<{payload: string, timeZone: string, clientId: string}> {
    const headers: IHeaders = {
        "Content-Type": "application/json",
        "x-api-key": session.apiKey
    };
    if (session.jwtKey != undefined && session.jwtKey.length > 0) {
        headers["x-signature"] = session.generateSignature();
    }

    // Execute request
    const response: rm.IRestResponse<IApiResponse> = await session.client.create("https://trustdecision.hypersolutions.co/payload", input, {
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
    if (response.result.timeZone == undefined) {
        throw new InvalidApiResponseError("No timeZone obtained from API");
    }
    if (response.result.clientId == undefined) {
        throw new InvalidApiResponseError("No clientId obtained from API");
    }
    return {
        payload: response.result.payload,
        timeZone: response.result.timeZone,
        clientId: response.result.clientId
    };
}