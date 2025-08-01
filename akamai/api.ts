import {generateSignature, Session} from "../index";
import * as rm from "typed-rest-client/RestClient";
import {IHeaders} from "typed-rest-client/Interfaces";

/**
 * API response schema.
 */
export interface IApiResponse {
    /**
     * The payload.
     */
    payload?: string;

    /**
     * The context
     */
    context?: string;

    /**
     * Error message.
     */
    error?: string;
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
 * Executes a request at the given URL with the given input.
 *
 * Note: not a public API.
 * @param session The {@link Session}
 * @param url The API URL
 * @param input The request body
 */
export async function sendRequest(session: Session, url: string, input: any): Promise<string> {
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
    const response: rm.IRestResponse<IApiResponse> = await session.client.create(url, input, {
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
    return response.result.payload;
}
