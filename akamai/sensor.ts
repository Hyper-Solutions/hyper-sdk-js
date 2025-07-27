import {generateSignature, Session} from "../index";
import {IApiResponse, InvalidApiResponseError} from "./api";
import {IHeaders} from "typed-rest-client/Interfaces";
import * as rm from "typed-rest-client";

/**
 * Sensor data input.
 */
export class SensorInput {
    readonly abck: string;
    readonly bmsz: string;
    readonly version: string;
    readonly pageUrl: string;
    readonly userAgent: string;
    readonly ip: string;
    readonly acceptLanguage: string;
    readonly context: string;
    readonly scriptHash?: string;
    readonly dynamicValues?: string;

    /**
     * Creates a new instance.
     * Refer to the {@link https://docs.justhyped.dev/api-reference/akamai|documentation} for more information.
     * @param abck The current `_abck` cookie.
     * @param bmsz The current `bm_sz` cookie.
     * @param version The Akamai web SDK version.
     * @param pageUrl The URL of the page.
     * @param userAgent The user agent to impersonate.
     * @param ip The IPV4 address of your network or proxy.
     * @param acceptLanguage Your accept-language header.
     * @param context Empty on first sensor, context from last sensor response on subsequent sensors.
     * @param scriptHash The hash of the script, optional.
     * @param dynamicValues The dynamic values required for v3 dynamic version.
     */
    public constructor(abck: string, bmsz: string, version: string, pageUrl: string, userAgent: string, ip: string, acceptLanguage: string, context: string, scriptHash?: string, dynamicValues?: string) {
        this.abck = abck;
        this.bmsz = bmsz;
        this.version = version;
        this.pageUrl = pageUrl;
        this.userAgent = userAgent;
        this.scriptHash = scriptHash;
        this.ip = ip;
        this.acceptLanguage = acceptLanguage;
        this.dynamicValues = dynamicValues;
        this.context = context;
    }
}

/**
 * Generates sensor data that can be used to obtain a valid `_abck` cookie.
 * @param session The {@link Session}
 * @param input The {@link SensorInput}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain sensor data
 */
export async function generateSensorData(session: Session, input: SensorInput): Promise<{payload: string, context: string}> {
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
    const response: rm.IRestResponse<IApiResponse> = await session.client.create("https://akm.hypersolutions.co/v2/sensor", input, {
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
    if (response.result.context == undefined) {
        throw new InvalidApiResponseError("No context obtained from API");
    }
    return {
        payload: response.result.payload,
        context: response.result.context
    };
}
