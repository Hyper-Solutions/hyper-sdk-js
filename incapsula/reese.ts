import { sendPayloadRequest } from "../shared/api-client";
import { Session } from "../index";

/**
 * Reese84 API input.
 */
export class Reese84Input {
    readonly userAgent: string;
    readonly ip: string;
    readonly acceptLanguage: string;
    readonly pageUrl: string;
    readonly pow?: string;
    readonly script: string;
    readonly scriptUrl: string;

    /**
     * Creates a new instance.
     * @param userAgent The user agent to impersonate
     * @param ip The IPV4 address of your network or proxy.
     * @param acceptLanguage Your accept-language header.
     * @param pageUrl The page url.
     * @param script Your script string.
     * @param scriptUrl Important when solving reese on Pardon Our Interruption page
     * @param pow Your pow string (optional).
     */
    public constructor(userAgent: string, ip: string, acceptLanguage: string, pageUrl: string, script: string, scriptUrl: string, pow?: string) {
        this.userAgent = userAgent;
        this.ip = ip;
        this.acceptLanguage = acceptLanguage;
        this.pageUrl = pageUrl;
        this.script = script;
        this.scriptUrl = scriptUrl;
        this.pow = pow;
    }
}

/**
 * Generates a reese84 sensor that can be used to obtain a valid `reese84` cookie.
 * @param session The {@link Session}
 * @param input The {@link Reese84Input}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain a reese84 sensor
 */
export async function generateReese84Sensor(session: Session, input: Reese84Input): Promise<string> {
    return sendPayloadRequest(session, "https://incapsula.hypersolutions.co/reese84", input);
}