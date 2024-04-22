import {Session} from "../index";
import * as rm from "typed-rest-client/RestClient";
import {IHeaders} from "typed-rest-client/Interfaces";

/**
 * API response schema.
 */
interface IApiResponse {
    /**
     * The payload.
     */
    payload: string;
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
    // Create request headers
    const headers: IHeaders = {
        "Content-Type": "application/json",
        "X-Api-Key": session.apiKey
    };
    if (session.jwtKey != undefined && session.jwtKey.length > 0) {
        headers["X-Signature"] = session.generateSignature();
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
    return response.result.payload;
}
