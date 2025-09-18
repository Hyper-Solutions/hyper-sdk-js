import {sign} from "jsonwebtoken";

/**
 * Compression types supported by the SDK
 */
export enum CompressionType {
    Gzip = "gzip",
}

/**
 * An invalid API key was passed into {@link Session}.
 */
export class InvalidApiKeyError extends Error {
}

/**
 * A caller attempted to call {@link Session#generateSignature|generateSignature} when the
 * {@link Session} doesn't have a JWT key set.
 */
export class NoJwtKeyError extends Error {
}

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
 * Session options for configuring the SDK behavior
 */
export interface SessionOptions {
    /**
     * Compression type for requests. Defaults to Gzip for best performance.
     * When enabled, requests larger than compressionThreshold bytes will be compressed.
     */
    compression?: CompressionType;

    /**
     * Request timeout in milliseconds. Defaults to 30000 (30 seconds).
     */
    timeout?: number;

    /**
     * HTTP proxy URL. Supports HTTP and HTTPS proxies.
     * Format: http://[username:password@]host:port
     * Example: http://proxy.example.com:8080 or http://user:pass@proxy.example.com:8080
     *
     * WARNING: Proxy support adds significant latency and should only be used for debugging
     * network issues or when absolutely necessary. Direct connections are much faster.
     */
    proxy?: string;

    /**
     * Whether to reject unauthorized certificates (self-signed, expired, etc.).
     * Set to false to allow self-signed certificates. Defaults to true for security.
     * WARNING: Setting this to false makes connections vulnerable to man-in-the-middle attacks.
     */
    rejectUnauthorized?: boolean;
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

    /**
     * The compression type for requests.
     */
    public readonly compression: CompressionType;

    /**
     * Request timeout in milliseconds.
     */
    public readonly timeout: number;

    /**
     * Proxy used to make API requests.
     */
    public readonly proxy?: string;

    /**
     * Whether to reject unauthorized certificates.
     */
    public readonly rejectUnauthorized: boolean;

    /**
     * Creates a new session.
     * @param apiKey Your Hyper Solutions API key
     * @param jwtKey Your JWT key. This is only required if you wish to utilize request signing to prevent replay attacks.
     * @param appKey Optional application key
     * @param appSecret Optional application secret
     * @param options Optional session configuration
     */
    public constructor(
        apiKey: string,
        jwtKey?: string,
        appKey?: string,
        appSecret?: string,
        options?: SessionOptions
    ) {
        if (apiKey.length == 0) {
            throw new InvalidApiKeyError();
        }

        this.apiKey = apiKey;
        this.jwtKey = jwtKey;
        this.appKey = appKey;
        this.appSecret = appSecret;
        this.compression = options?.compression ?? CompressionType.Gzip;
        this.timeout = options?.timeout ?? 30000;
        this.proxy = options?.proxy;
        this.rejectUnauthorized = options?.rejectUnauthorized ?? true;
    }
}

export * from './akamai';
export * from './datadome';
export * from './incapsula';
export * from './kasada';
export * from './trustdecision';