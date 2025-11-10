import { Agent, ProxyAgent, request } from 'undici';
import { promisify } from "util";
import * as zlib from "zlib";
import { CompressionType, generateSignature, Session } from "../index";


// Compression utilities
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);
const brotliDecompress = promisify(zlib.brotliDecompress);

/**
 * Generic API response interface
 */
export interface IBaseApiResponse {
    error?: string;
}

/**
 * An invalid API response error
 */
export class InvalidApiResponseError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

/**
 * Compresses payload using the specified compression type
 */
async function compressPayload(payload: Buffer, compression: CompressionType): Promise<Buffer> {
    switch (compression) {
        case CompressionType.Gzip:
            return await gzip(payload);
        default:
            return payload;
    }
}

/**
 * Decompresses response based on content-encoding header
 */
async function decompressResponse(responseBuffer: Buffer, contentEncoding?: string): Promise<Buffer> {
    switch (contentEncoding) {
        case 'gzip':
            return await gunzip(responseBuffer);
        case 'br':
            return await brotliDecompress(responseBuffer);
        default:
            return responseBuffer;
    }
}

/**
 * HTTP/2 client with full compression support using undici
 */
export async function sendRequest<TInput = any, TResponse extends IBaseApiResponse = IBaseApiResponse>(
    session: Session,
    url: string,
    input: TInput,
    validateResponse?: (response: TResponse) => void
): Promise<TResponse> {
    // Validate session
    if (!session.apiKey) {
        throw new InvalidApiResponseError("Missing API key");
    }

    // Prepare request payload
    const jsonPayload = JSON.stringify(input);
    let requestBody = Buffer.from(jsonPayload, 'utf8');
    let useCompression = false;

    // Check if payload should be compressed
    if (requestBody.length > 1000) {
        try {
            //@ts-ignore - Type mismatch between Buffer and ArrayBuffer
            requestBody = await compressPayload(requestBody, session.compression);
            useCompression = true;
        } catch (err) {
            throw new InvalidApiResponseError(`Failed to compress request body with ${session.compression}: ${err}`);
        }
    }

    // Prepare headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Api-Key': session.apiKey,
        'Accept-Encoding': session.compression,
        'User-Agent': 'Hyper Solutions TypeScript SDK'
    };

    // Set compression header if used
    if (useCompression) {
        headers['Content-Encoding'] = session.compression;
    }

    // Add JWT signature if available
    if (session.jwtKey && session.jwtKey.length > 0) {
        headers['X-Signature'] = generateSignature(session.apiKey, session.jwtKey);
    }

    // Add app signature if available
    if (session.appKey && session.appKey.length > 0 &&
        session.appSecret && session.appSecret.length > 0) {
        headers['x-app-signature'] = generateSignature(session.appKey, session.appSecret);
        headers['x-app-key'] = session.appKey;
    }

    try {
        // Prepare request options
        const requestOptions: any = {
            method: 'POST',
            headers,
            body: requestBody,
            headersTimeout: session.timeout,
            bodyTimeout: session.timeout * 2
        };

        // Add proxy support if configured
        if (session.proxy) {
            requestOptions.dispatcher = new ProxyAgent({
                uri: session.proxy,
                requestTls: {
                    rejectUnauthorized: session.rejectUnauthorized,
                    allowH2: true,
                }
            });
        } else {
            requestOptions.dispatcher = new Agent({
                connect: {
                    rejectUnauthorized: session.rejectUnauthorized,
                    allowH2: true
                }
            });
        }

        // Make HTTP request using undici
        const response = await request(url, requestOptions);

        // Read response body
        let responseBody = Buffer.from(await response.body.arrayBuffer());

        // Decompress response if needed
        const contentEncoding = response.headers['content-encoding'] as string;
        if (contentEncoding) {
            //@ts-ignore - Type mismatch between Buffer and ArrayBuffer
            responseBody = await decompressResponse(responseBody, contentEncoding);
        }

        // Parse JSON response
        let result: TResponse;
        try {
            result = JSON.parse(responseBody.toString('utf8'));
        } catch (err) {
            throw new InvalidApiResponseError(`Invalid JSON response: ${err}`);
        }

        // Validate response
        if (result.error) {
            throw new InvalidApiResponseError(result.error);
        }

        // Check status code
        if (response.statusCode !== 200) {
            throw new InvalidApiResponseError(`Bad HTTP status code ${response.statusCode}`);
        }

        // Run custom validation if provided
        if (validateResponse) {
            validateResponse(result);
        }

        return result;

    } catch (err) {
        if (err instanceof InvalidApiResponseError) {
            throw err;
        }
        throw new InvalidApiResponseError(`Request failed: ${err}`);
    }
}

/**
 * Response types for different services
 */
export interface IPayloadResponse extends IBaseApiResponse {
    payload?: string;
}

export interface IPayloadWithHeadersResponse extends IBaseApiResponse {
    payload?: string;
    headers?: { [key: string]: string };
}

export interface IPayloadWithContextResponse extends IBaseApiResponse {
    payload?: string;
    context?: string;
}

export interface IUtmvcResponse extends IBaseApiResponse {
    payload?: string;
    swhanedl?: string;
}

export interface IKasadaResponse extends IBaseApiResponse {
    payload?: string;
    headers?: KasadaHeaders;
}

export interface KasadaHeaders {
    "x-kpsdk-ct": string;
    "x-kpsdk-dt": string;
    "x-kpsdk-v": string;
    "x-kpsdk-r": string;
    "x-kpsdk-dv": string;
    "x-kpsdk-h": string;
    "x-kpsdk-fc": string;
    "x-kpsdk-im": string;
}

/**
 * Helper function for simple payload-only requests (Akamai, Incapsula)
 */
export async function sendPayloadRequest<TInput = any>(
    session: Session,
    url: string,
    input: TInput
): Promise<string> {
    const response = await sendRequest<TInput, IPayloadResponse>(
        session,
        url,
        input,
        (res) => {
            if (!res.payload) {
                throw new InvalidApiResponseError("No payload obtained from API");
            }
        }
    );

    return response.payload!;
}

/**
 * Helper function for payload + headers requests (DataDome)
 */
export async function sendPayloadWithHeadersRequest<TInput = any>(
    session: Session,
    url: string,
    input: TInput
): Promise<{ payload: string; headers: { [key: string]: string } }> {
    const response = await sendRequest<TInput, IPayloadWithHeadersResponse>(
        session,
        url,
        input,
        (res) => {
            if (!res.payload) {
                throw new InvalidApiResponseError("No payload obtained from API");
            }
        }
    );

    return {
        payload: response.payload!,
        headers: response.headers || {}
    };
}

/**
 * Helper function for Kasada requests
 */
export async function sendKasadaPayloadRequest<TInput = any>(
    session: Session,
    url: string,
    input: TInput
): Promise<{ payload: string; headers: KasadaHeaders }> {
    const response = await sendRequest<TInput, IKasadaResponse>(
        session,
        url,
        input,
        (res) => {
            if (!res.payload) {
                throw new InvalidApiResponseError("No payload obtained from API");
            }
            if (!res.headers) {
                throw new InvalidApiResponseError("No headers obtained from API");
            }
        }
    );

    return {
        payload: response.payload!,
        headers: response.headers!
    };
}