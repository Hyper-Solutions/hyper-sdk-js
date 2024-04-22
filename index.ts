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

    readonly client: rm.RestClient;

    /**
     * Creates a new session.
     * @param apiKey Your Hyper Solutions API key
     * @param jwtKey Your JWT key. This is only required if you wish to utilize request signing to prevent replay attacks.
     * @param requestOptions Request options for the internal HTTP client
     */
    public constructor(apiKey: string, jwtKey?: string, requestOptions?: IRequestOptions) {
        if (apiKey.length == 0) {
            throw new InvalidApiKeyError();
        }

        this.apiKey = apiKey;
        this.jwtKey = jwtKey;
        this.client = new rm.RestClient("Hyper Solutions TypeScript SDK", undefined, undefined, requestOptions);
    }

    /**
     * Generates the value used for the `X-Signature` API request header.
     *
     * The signature is automatically added if `jwtKey` is set.
     */
    public generateSignature(): string {
        if (this.jwtKey == undefined || this.jwtKey.length == 0) {
            throw new NoJwtKeyError();
        }

        return sign(
            {
                "key": this.apiKey,
                "exp": Math.floor(Date.now() / 1000) + 60 // 60 seconds
            },
            this.jwtKey,
            {
                algorithm: "HS256"
            }
        );
    }
}
