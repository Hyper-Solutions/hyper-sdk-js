import {Session} from "../index";
import {sendRequest} from "./api";

/**
 * Sbsd input.
 */
export class SbsdInput {
    readonly userAgent: string;
    readonly uuid: string;
    readonly pageUrl: string;
    readonly o: string;
    readonly ip?: string;
    readonly language?: string;

    /**
     * Creates a new instance.
     * Refer to the {@link https://docs.justhyped.dev/akamai-web/api-reference|documentation} for more information.
     * @param uuid The uuid of the sbsd challenge (https://example.com/.well-known/sbsd?v=dcc78710-14fe-3835-cc6e-b9b5ea3b6010). uuid is dcc78710-14fe-3835-cc6e-b9b5ea3b6010 on this url.
     * @param o_cookie The "sbsd_o" cookie value
     * @param pageUrl The URL of the page
     * @param userAgent The user agent to impersonate
     * @param ip The IP of the Proxy / Network that will is used to interact with the target site.
     * @param language The language of your browser.
     */
    public constructor(uuid: string, o_cookie: string, pageUrl: string, userAgent: string, ip?: string, language?: string) {
        this.uuid = uuid;
        this.pageUrl = pageUrl;
        this.userAgent = userAgent;
        this.o = o_cookie;
        this.ip = ip;
        this.language = language;
    }
}

/**
 * Generates SBSD data that can be used to obtain a valid `sbsd` cookie.
 * @param session The {@link Session}
 * @param input The {@link SbsdInput}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain sbsd sensor data
 */
export async function generateSbsdPayload(session: Session, input: SbsdInput): Promise<string> {
    return sendRequest(session, "https://akm.justhyped.dev/sbsd", input);
}
