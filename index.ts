import * as rm from "typed-rest-client/RestClient";
import {sign} from "jsonwebtoken";
import {IRequestOptions} from "typed-rest-client/Interfaces";

/**
 * An invalid API key was passed into {@link Session}.
 */
export class InvalidApiKeyError extends Error {}

/**
 * A caller attempted to call {@link Session#generateSignature|generateSignature} when the
 * {@link Session} doesn't have a JWT key set.
 */
export class NoJwtKeyError extends Error {}

/**
 * Generates the value used for the `X-Signature` API request header.
 *
 * @param apiKey The API key to include in the signature
 * @param jwtKey The JWT key used to sign the payload
 * @returns The generated JWT signature string
 * @throws {Error} If apiKey or jwtKey is empty or undefined
 */
export function generateSignature(apiKey: string, jwtKey: string): string {
    if (!apiKey || apiKey.length === 0) {
        throw new Error("API key is required");
    }

    if (!jwtKey || jwtKey.length === 0) {
        throw new Error("JWT key is required");
    }

    return sign(
        {
            "key": apiKey,
            "exp": Math.floor(Date.now() / 1000) + 60 // 60 seconds
        },
        jwtKey,
        {
            algorithm: "HS256"
        }
    );
}

/**
 * A session that can be used to interact with the Hyper Solutions API services.
 */
export class Session {
    /**
     * The API key.
     */
    public readonly apiKey: string;

    /**
     * The optional JWT key.
     */
    public readonly jwtKey?: string;

    /**
     * The optional application key.
     */
    public readonly appKey?: string;

    /**
     * The optional application secret.
     */
    public readonly appSecret?: string;

    readonly client: rm.RestClient;

    /**
     * Creates a new session.
     * @param apiKey Your Hyper Solutions API key
     * @param jwtKey Your JWT key. This is only required if you wish to utilize request signing to prevent replay attacks.
     * @param appKey Optional application key
     * @param appSecret Optional application secret
     * @param requestOptions Request options for the internal HTTP client
     */
    public constructor(apiKey: string, jwtKey?: string, appKey?: string, appSecret?: string, requestOptions?: IRequestOptions) {
        if (apiKey.length == 0) {
            throw new InvalidApiKeyError();
        }

        this.apiKey = apiKey;
        this.jwtKey = jwtKey;
        this.appKey = appKey;
        this.appSecret = appSecret;
        this.client = new rm.RestClient("Hyper Solutions TypeScript SDK", undefined, undefined, requestOptions);
    }
}