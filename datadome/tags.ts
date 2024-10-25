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
    readonly language?: string;

    /**
     * Creates a new instance.
     * Refer to the {@link https://docs.justhyped.dev/akamai-web/api-reference|documentation} for more information.
     * @param userAgent The user agent to impersonate
     * @param cid Your current datadome cookie
     * @param ddk sitekey, static for each site. parse it from the /js/ payload request from browser
     * @param referer The referer visible as the referer header in the payload POST
     * @param type First time 'ch', second time 'le'
     * @param language The first language of your accept-language header, defaults to "en-US"
     * @param ip The IP that is used to post the sensor data to the target site. You can use /ip to get the IP from a connection. If you are not using proxies, this will be the IPv4 address of your pc.
     */
    public constructor(userAgent: string, cid: string, ddk: string, referer: string, type: string, ip: string, language?: string) {
        this.userAgent = userAgent;
        this.cid = cid;
        this.ddk = ddk;
        this.referer = referer;
        this.type = type;
        this.ip = ip;
        this.language = language;
    }
}

/**
 * Generates a DataDome tags payload that can be used to obtain a solved `datadome` cookie.
 * @param session The {@link Session}
 * @param input The {@link InterstitialInput}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain a tags payload
 */
export function generateTagsPayload(session: Session, input: TagsInput): Promise<string> {
    return sendRequest(session, "https://datadome.justhyped.dev/tags", input);
}
