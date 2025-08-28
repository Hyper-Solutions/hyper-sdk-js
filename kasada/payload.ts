import { Session } from "../index";
import { sendKasadaPayloadRequest, KasadaHeaders } from "../shared/api-client";

/**
 * Kasada payload input.
 */
export class KasadaPayloadInput {
    readonly userAgent: string;
    readonly ipsLink: string;
    readonly script: string;
    readonly acceptLanguage: string;
    readonly ip: string;

    /**
     * Creates a new instance.
     * @param userAgent The user agent to impersonate
     * @param ipsLink The ips.js script link, parsed from the block page (429 status code)
     * @param script The ips.js script retrieved using the IpsLink url
     * @param ip The IPV4 address of your network or proxy.
     * @param acceptLanguage Your accept-language header.
     */
    public constructor(userAgent: string, ipsLink: string, script: string, ip: string, acceptLanguage: string) {
        this.userAgent = userAgent;
        this.ipsLink = ipsLink;
        this.script = script;
        this.ip = ip;
        this.acceptLanguage = acceptLanguage;
    }
}

/**
 * Kasada payload output.
 */
export interface KasadaPayloadOutput {
    /**
     * The payload as a string, base64 encoded for easier handling, make sure to POST the decoded bytes to /tl.
     */
    payload: string;

    /**
     * Kasada headers.
     */
    headers: KasadaHeaders;
}

/**
 * Generates Kasada payload that can be used to obtain a valid `x-kpsdk-ct` token.
 * @param session The {@link Session}
 * @param input The {@link KasadaPayloadInput}
 * @returns {Promise<KasadaPayloadOutput>} A {@link Promise} that, when resolved, will contain the decoded Kasada /tl payload and headers.
 */
export async function generateKasadaPayload(session: Session, input: KasadaPayloadInput): Promise<KasadaPayloadOutput> {
    return sendKasadaPayloadRequest(session, "https://kasada.hypersolutions.co/payload", input);
}