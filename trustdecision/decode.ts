import { Session } from "../index";
import { sendPayloadRequest } from "../shared/api-client";

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
    return sendPayloadRequest(session, "https://trustdecision.hypersolutions.co/decode", input);
}