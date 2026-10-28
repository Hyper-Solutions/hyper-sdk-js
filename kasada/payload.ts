import { Session } from "../index.js";
import type { KasadaPayloadResult } from "../shared/results.js";
import { sendKasadaPayloadRequest } from "../shared/api-client.js";

/**
 * Kasada payload input.
 */
export class KasadaPayloadInput {
    readonly userAgent: string;
    readonly ipsLink: string;
    readonly script: string;
    readonly acceptLanguage: string;
    readonly ip: string;
    readonly strict?: boolean;
    readonly dv?: string;

    /**
     * Creates a new instance.
     * @param userAgent The user agent to impersonate
     * @param ipsLink The ips.js script link, parsed from the block page (429 status code)
     * @param script The ips.js script retrieved using the IpsLink url
     * @param ip The IPV4 address of your network or proxy.
     * @param acceptLanguage Your accept-language header.
     * @param strict Refuse the payload instead of returning one built on a guess when the script has a signal the API cannot identify yet. The request then fails with "Unidentified signals in script; refusing payload because strict was set". Off by default: such a payload usually still works.
     * @param dv The `x-kpsdk-dv` header the iOS app flow sends, exactly as sent (see {@link generateKasadaDv}). Optional, iOS app user agents only: the payload is then generated on a device with the screen of the model it names and the iOS release it names, so the two agree.
     */
    public constructor(userAgent: string, ipsLink: string, script: string, ip: string, acceptLanguage: string, strict: boolean = false, dv?: string) {
        this.userAgent = userAgent;
        this.ipsLink = ipsLink;
        this.script = script;
        this.ip = ip;
        this.acceptLanguage = acceptLanguage;
        // Left out of the request body unless set.
        this.strict = strict || undefined;
        this.dv = dv || undefined;
    }
}

/**
 * @deprecated Use {@link KasadaPayloadResult}.
 */
export type KasadaPayloadOutput = KasadaPayloadResult;

/**
 * Generates Kasada payload that can be used to obtain a valid `x-kpsdk-ct` token.
 * @param session The {@link Session}
 * @param input The {@link KasadaPayloadInput}
 * @returns {Promise<KasadaPayloadResult>} A {@link Promise} that, when resolved, will contain the Kasada /tl payload, its x-kpsdk-* headers and the client hints.
 */
export async function generateKasadaPayload(session: Session, input: KasadaPayloadInput): Promise<KasadaPayloadResult> {
    return sendKasadaPayloadRequest(session, "https://kasada.hypersolutions.co/payload", input);
}