import {Session} from "../index";
import * as rm from "typed-rest-client/RestClient";
import {IHeaders} from "typed-rest-client/Interfaces";

/**
 * Input for Kasada Proof of Work calculation.
 */
export class KasadaPowInput {
    /**
     * The x-kpsdk-st value returned by the /tl POST request.
     */
    st: number;
    /**
     * The x-kpsdk-ct value returned by the /tl POST request.
     */
    ct: string;

    /**
     * Can be used to pre-generate POW strings.
     * This field is optional.
     */
    workTime?: number;

    /**
     * Creates a new instance of KasadaPowInput.
     * @param st The x-kpsdk-st value returned by the /tl POST request.
     * @param ct The x-kpsdk-ct value returned by the /tl POST request.
     * @param workTime Optional. Can be used to pre-generate POW strings.
     */
    constructor(st: number, ct: string, workTime?: number) {
        this.st = st;
        this.ct = ct;
        if (workTime !== undefined) {
            this.workTime = workTime;
        }
    }
}

/**
 * Generates Kasada POW (x-kpsdk-cd).
 * @param session The {@link Session}
 * @param input The {@link KasadaPowInput}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain the x-kpsdk-cd token.
 */
export async function generateKasadaPow(session: Session, input: KasadaPowInput): Promise<string> {
    return sendRequest(session, "https://kasada.hypersolutions.co/cd", input);
}


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
