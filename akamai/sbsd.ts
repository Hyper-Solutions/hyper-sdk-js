import {Session} from "../index";
import {sendRequest} from "./api";

/**
 * Sbsd input.
 */
export class SbsdInput {
    readonly index: number;
    readonly userAgent: string;
    readonly uuid: string;
    readonly pageUrl: string;
    readonly o: string;
    readonly script: string;
    readonly ip: string;
    readonly acceptLanguage: string;

    /**
     * Creates a new instance.
     * Refer to the {@link https://docs.justhyped.dev/akamai-web/api-reference|documentation} for more information.
     * @param uuid The uuid of the sbsd challenge (https://example.com/.well-known/sbsd?v=dcc78710-14fe-3835-cc6e-b9b5ea3b6010). uuid is dcc78710-14fe-3835-cc6e-b9b5ea3b6010 on this url.
     * @param o_cookie The "sbsd_o" cookie value
     * @param pageUrl The URL of the page
     * @param userAgent The user agent to impersonate
     * @param script The script content
     * @param ip The IPV4 address of your network or proxy.
     * @param acceptLanguage Your accept-language header.
     */
    public constructor(index: number, uuid: string, o_cookie: string, pageUrl: string, userAgent: string, script: string, ip: string, acceptLanguage: string) {
        this.index = index;
        this.uuid = uuid;
        this.pageUrl = pageUrl;
        this.userAgent = userAgent;
        this.o = o_cookie;
        this.script = script;
        this.ip = ip;
        this.acceptLanguage = acceptLanguage;
    }
}

/**
 * Generates SBSD data that can be used to obtain a valid `sbsd` cookie.
 * @param session The {@link Session}
 * @param input The {@link SbsdInput}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain sbsd sensor data
 */
export async function generateSbsdPayload(session: Session, input: SbsdInput): Promise<string> {
    return sendRequest(session, "https://akm.hypersolutions.co/sbsd", input);
}
