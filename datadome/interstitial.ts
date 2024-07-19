import {parseObject} from "./util";
import {Session} from "../index";
import {sendRequest} from "./api";

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
        b: dd.hasOwnProperty("b") ? dd.b.toString() : "0"
    };
    return "https://geo.captcha-delivery.com/interstitial/?" + new URLSearchParams(params).toString();
}

/**
 * Interstitial API input.
 */
export class InterstitialInput {
    /**
     * The browser user agent to impersonate.
     */
    readonly userAgent: string;

    /**
     * The device check URL obtained from {@link parseInterstitialDeviceCheckUrl}.
     */
    readonly deviceLink: string;

    /**
     * The response body obtained from doing a GET request to the device check URL.
     */
    readonly html: string;

    public constructor(userAgent: string, deviceLink: string, html: string) {
        this.userAgent = userAgent;
        this.deviceLink = deviceLink;
        this.html = html;
    }
}

/**
 * Generates a DataDome interstitial payload that can be used to obtain a solved `datadome` cookie.
 * @param session The {@link Session}
 * @param input The {@link InterstitialInput}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain a interstitial payload
 */
export function generateInterstitialPayload(session: Session, input: InterstitialInput): Promise<string> {
    return sendRequest(session, "https://datadome.justhyped.dev/interstitial", input);
}
