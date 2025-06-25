import {Session} from "../index";
import {IApiResponse, InvalidApiResponseError} from "./api";
import {IHeaders} from "typed-rest-client/Interfaces";
import * as rm from "typed-rest-client";

/**
 * TrustDecision session key decode input.
 */
export class DecodeInput {
    readonly result: string;
    readonly requestId: string;

    /**
     * Creates a new instance.
     * Refer to the {@link https://docs.justhyped.dev/api-reference/trust-decision|documentation} for more information.
     * @param result The result field from TrustDecision's fingerprinting endpoint response
     * @param requestId The requestId field from TrustDecision's fingerprinting endpoint response
     */
    public constructor(result: string, requestId: string) {
        this.result = result;
        this.requestId = requestId;
    }
}

/**
 * Decodes the result and requestId from TrustDecision's fingerprinting endpoint
 * to generate the td-session-key header value.
 * @param session The {@link Session}
 * @param input The {@link DecodeInput}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain the decoded session key
 */
export async function decodeTrustDecisionSessionKey(session: Session, input: DecodeInput): Promise<string> {
    const headers: IHeaders = {
        "Content-Type": "application/json",
        "x-api-key": session.apiKey
    };
    if (session.jwtKey != undefined && session.jwtKey.length > 0) {
        headers["x-signature"] = session.generateSignature();
    }

    // Execute request
    const response: rm.IRestResponse<IApiResponse> = await session.client.create("https://trustdecision.hypersolutions.co/decode", input, {
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