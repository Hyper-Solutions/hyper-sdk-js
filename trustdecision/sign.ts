import {Session} from "../index";
import {IApiResponse, InvalidApiResponseError} from "./api";
import {IHeaders} from "typed-rest-client/Interfaces";
import * as rm from "typed-rest-client";

/**
 * TrustDecision session signature generation input.
 */
export class SignatureInput {
    readonly clientId: string;
    readonly path: string;

    /**
     * Creates a new instance.
     * Refer to the {@link https://docs.justhyped.dev/api-reference/trust-decision|documentation} for more information.
     * @param clientId The client ID returned from the payload generation endpoint
     * @param path The API endpoint path that will be called. This should match the value used in the td-session-path header of your actual request.
     */
    public constructor(clientId: string, path: string) {
        this.clientId = clientId;
        this.path = path;
    }
}

/**
 * Generates a unique td-session-sign header value for each API request.
 * This signature can only be used once and must be regenerated for every request.
 * @param session The {@link Session}
 * @param input The {@link SignatureInput}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain the session signature
 */
export async function generateTrustDecisionSignature(session: Session, input: SignatureInput): Promise<string> {
    const headers: IHeaders = {
        "Content-Type": "application/json",
        "x-api-key": session.apiKey
    };
    if (session.jwtKey != undefined && session.jwtKey.length > 0) {
        headers["x-signature"] = session.generateSignature();
    }

    // Execute request
    const response: rm.IRestResponse<IApiResponse> = await session.client.create("https://trustdecision.hypersolutions.co/sign", input, {
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