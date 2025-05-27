import {sendRequest} from "./api";
import {Session} from "../index";

/**
 * Reese84 API input.
 */
export class Reese84Input {
    readonly userAgent: string;
    readonly site: string;
    readonly ip: string;
    readonly acceptLanguage: string;
    readonly pageUrl: string;
    readonly scriptUrl?: string;

    /**
     * Creates a new instance.
     * @param userAgent The user agent to impersonate
     * @param site The site identifier
     * @param ip The IPV4 address of your network or proxy.
     * @param pageUrl The page url.
     * @param acceptLanguage Your accept-language header.
     * @param scriptUrl Important when solving reese on Pardon Our Interruption page
     */
    public constructor(userAgent: string, site: string, ip: string, acceptLanguage: string, pageUrl: string, scriptUrl?: string) {
        this.userAgent = userAgent;
        this.site = site;
        this.ip = ip;
        this.acceptLanguage = acceptLanguage;
        this.pageUrl = pageUrl;
        this.scriptUrl = scriptUrl;
    }
}

/**
 * Generates a reese84 sensor that can be used to obtain a valid `reese84` cookie.
 * @param session The {@link Session}
 * @param input The {@link Reese84Input}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain a reese84 sensor
 */
export async function generateReese84Sensor(session: Session, input: Reese84Input): Promise<string> {
    return sendRequest(session, "https://incapsula.hypersolutions.co/reese84/" + input.site, input);
}
