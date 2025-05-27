import {parseObject} from "./util";
import {Session} from "../index";
import {sendRequest} from "./api";

/**
 * Tags API input.
 */
export class TagsInput {
    readonly userAgent: string;
    readonly cid: string;
    readonly ddk: string;
    readonly referer: string;
    readonly type: string;
    readonly ip: string;
    readonly acceptLanguage: string;

    /**
     * Creates a new instance.
     * Refer to the {@link https://docs.justhyped.dev/akamai-web/api-reference|documentation} for more information.
     * @param userAgent The user agent to impersonate
     * @param cid Your current datadome cookie
     * @param ddk sitekey, static for each site. parse it from the /js/ payload request from browser
     * @param referer The referer visible as the referer header in the payload POST
     * @param type First time 'ch', second time 'le'
     * @param ip The IPV4 address of your network or proxy.
     * @param acceptLanguage Your accept-language header.
     */
    public constructor(userAgent: string, cid: string, ddk: string, referer: string, type: string, ip: string, acceptLanguage: string) {
        this.userAgent = userAgent;
        this.cid = cid;
        this.ddk = ddk;
        this.referer = referer;
        this.type = type;
        this.ip = ip;
        this.acceptLanguage = acceptLanguage;
    }
}

/**
 * Generates a DataDome tags payload that can be used to obtain a solved `datadome` cookie.
 * @param session The {@link Session}
 * @param input The {@link InterstitialInput}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain a tags payload
 */
export function generateTagsPayload(session: Session, input: TagsInput): Promise<string> {
    return sendRequest(session, "https://datadome.hypersolutions.co/tags", input);
}
