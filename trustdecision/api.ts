/**
 * API response schema for TrustDecision API.
 */
export interface IApiResponse {
    /**
     * The payload - can be TrustDecision payload, decoded session key, or session signature.
     */
    payload?: string;

    /**
     * The timezone to use in the tz header for subsequent requests (from /payload endpoint).
     */
    timeZone?: string;

    /**
     * The client ID required for generating session signatures (from /payload endpoint).
     */
    clientId?: string;

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