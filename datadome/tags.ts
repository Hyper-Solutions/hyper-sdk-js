import { Session } from "../index";
import { sendPayloadRequest } from "../shared/api-client";

/**
 * Tags API input.
 */
export class TagsInput {
    readonly userAgent: string;
    readonly cid?: string;
    readonly ddk: string;
    readonly referer: string;
    readonly type: string;
    readonly ip: string;
    readonly acceptLanguage: string;
    readonly version: string;

    /**
     * Creates a new instance.
     * Refer to the {@link https://docs.justhyped.dev/akamai-web/api-reference|documentation} for more information.
     * @param userAgent The user agent to impersonate
     * @param ddk sitekey, static for each site. parse it from the /js/ payload request from browser
     * @param referer The referer visible as the referer header in the payload POST
     * @param type First time 'ch', second time 'le'
     * @param ip The IPV4 address of your network or proxy.
     * @param acceptLanguage Your accept-language header.
     * @param version Version string
     * @param cid Your current datadome cookie (optional)
     */
    public constructor(userAgent: string, ddk: string, referer: string, type: string, ip: string, acceptLanguage: string, version: string, cid?: string) {
        this.userAgent = userAgent;
        this.ddk = ddk;
        this.referer = referer;
        this.type = type;
        this.ip = ip;
        this.acceptLanguage = acceptLanguage;
        this.version = version;
        this.cid = cid;
    }
}

/**
 * Generates a DataDome tags payload that can be used to obtain a solved `datadome` cookie.
 * @param session The {@link Session}
 * @param input The {@link TagsInput}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain a tags payload
 */
export function generateTagsPayload(session: Session, input: TagsInput): Promise<string> {
    return sendPayloadRequest(session, "https://datadome.hypersolutions.co/tags", input);
}