import { Session } from "../index";
import {sendPayloadRequest, sendRequest} from "../shared/api-client";

/**
 * BotID header input.
 */
export class BotIDHeaderInput {
    readonly script: string;
    readonly userAgent: string;
    readonly ip: string;
    readonly acceptLanguage: string;

    /**
     * Creates a new instance.
     * @param script The c.js script retrieved from the BotID script endpoint
     * @param userAgent The user agent to impersonate
     * @param ip The IPV4 address of your network or proxy.
     * @param acceptLanguage Your accept-language header.
     */
    public constructor(script: string, userAgent: string, ip: string, acceptLanguage: string) {
        this.script = script;
        this.userAgent = userAgent;
        this.ip = ip;
        this.acceptLanguage = acceptLanguage;
    }
}

/**
 * Generates a BotID header that can be used as the `x-is-human` header value.
 * @param session The {@link Session}
 * @param input The {@link BotIDHeaderInput}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain the x-is-human header value.
 */
export async function generateBotIDHeader(session: Session, input: BotIDHeaderInput): Promise<string> {
    return sendPayloadRequest(session, "https://kasada.hypersolutions.co/botid", input);

}