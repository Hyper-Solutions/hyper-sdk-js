import { parseObject } from "./util";
import { Session } from "../index";
import { sendPayloadWithHeadersRequest } from "../shared/api-client";

/**
 * Parses the device check URL (`/interstitial/?initialCid`...) from a blocked response body.
 * @param body The response body
 * @param cookie The `datadome` cookie value
 * @param referer The referer
 */
export function parseInterstitialDeviceCheckUrl(body: string, cookie: string, referer: string): string | null {
    const dd = parseObject(body);
    if (dd == null) {
        return null;
    }

    const params = {
        initialCid: dd.cid,
        hash: dd.hsh,
        cid: cookie,
        referer,
        s: dd.hasOwnProperty("s") ? dd.s.toString() : "0",
        e: dd.e,
        b: dd.hasOwnProperty("b") ? dd.b.toString() : "0",
        dm: "cd"
    };
    return "https://geo.captcha-delivery.com/interstitial/?" + new URLSearchParams(params).toString();
}

/**
 * Interstitial API input.
 */
export class InterstitialInput {
    readonly userAgent: string;
    readonly deviceLink: string;
    readonly html: string;
    readonly ip: string;
    readonly acceptLanguage: string;

    /**
     * Creates a new InterstitialInput instance.
     * @param userAgent The browser user agent to impersonate.
     * @param deviceLink The device check URL obtained from {@link parseInterstitialDeviceCheckUrl}.
     * @param html The response body obtained from doing a GET request to the device check URL.
     * @param ip The IPV4 address of your network or proxy.
     * @param acceptLanguage Your accept-language header.
     */
    public constructor(userAgent: string, deviceLink: string, html: string, ip: string, acceptLanguage: string) {
        this.userAgent = userAgent;
        this.deviceLink = deviceLink;
        this.html = html;
        this.ip = ip;
        this.acceptLanguage = acceptLanguage;
    }
}

/**
 * Generates a DataDome interstitial payload that can be used to obtain a solved `datadome` cookie.
 * @param session The {@link Session}
 * @param input The {@link InterstitialInput} containing required parameters for interstitial payload generation
 * @returns {Promise<{payload: string, headers: {[key: string]: string}}>} A {@link Promise} that resolves to an object containing the interstitial payload and response headers
 */
export function generateInterstitialPayload(session: Session, input: InterstitialInput): Promise<{ payload: string, headers: { [key: string]: string } }> {
    return sendPayloadWithHeadersRequest(session, "https://datadome.hypersolutions.co/interstitial", input);
}