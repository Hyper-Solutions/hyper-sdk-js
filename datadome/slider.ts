import {parseObject} from "./util";
import {sendRequestWithHeaders} from "./api";
import {Session} from "../index";

/**
 * Slider parse result.
 */
export class SliderParseResult {
    /**
     * If the IP address is banned.
     */
    readonly isIpBanned: boolean;

    /**
     * Device check URL.
     *
     * Only set if parsing was successful.
     */
    readonly url?: string;

    constructor(isIpBanned: boolean, url?: string) {
        this.url = url;
        this.isIpBanned = isIpBanned;
    }
}

/**
 * Parses the device check URL (`/captcha/?initialCid`...) from a captcha page.
 * @param body The response body
 * @param cookie The `datadome` cookie
 * @param referer The referer
 */
export function parseSliderDeviceCheckUrl(body: string, cookie: string, referer: string): SliderParseResult {
    const dd = parseObject(body);
    if (dd == null) {
        return new SliderParseResult(false);
    }

    if (dd.t === "bv") {
        return new SliderParseResult(true);
    }

    const params = {
        initialCid: dd.cid,
        hash: dd.hsh,
        cid: cookie,
        t: dd.t,
        referer,
        s: dd.hasOwnProperty("s") ? dd.s.toString() : "0",
        e: dd.e,
        dm: "cd"
    };
    return new SliderParseResult(
        false,
        "https://geo.captcha-delivery.com/captcha/?" + new URLSearchParams(params).toString()
    );
}

/**
 * Slider API input.
 */
export class SliderInput {
    /**
     * The browser user agent to impersonate.
     */
    readonly userAgent: string;

    /**
     * The device check URL obtained from {@link parseSliderDeviceCheckUrl}.
     */
    readonly deviceLink: string;

    /**
     * The response body obtained from doing a GET request to the device check URL.
     */
    readonly html: string;

    /**
     * The captcha puzzle image bytes, base64 encoded.
     *
     * The URL that returns the puzzle image looks like this:
     * `https://dd.prod.captcha-delivery.com/image/2024-xx-xx/hash.jpg`
     */
    readonly puzzle: string;

    /**
     * The captcha puzzle piece image bytes, base64 encoded.
     *
     * The URL that returns the puzzle piece image looks like this:
     * `https://dd.prod.captcha-delivery.com/image/2024-xx-xx/hash.frag.png`
     */
    readonly piece: string;

    readonly parentUrl: string;
    readonly ip: string;
    readonly language: string;

    public constructor(userAgent: string, deviceLink: string, html: string, puzzle: string, piece: string, parentUrl: string, ip: string, language: string) {
        this.userAgent = userAgent;
        this.deviceLink = deviceLink;
        this.html = html;
        this.puzzle = puzzle;
        this.piece = piece;
        this.parentUrl = parentUrl;
        this.ip = ip;
        this.language = language;
    }
}

/**
 * Generates a DataDome slider payload that can be used to obtain a solved `datadome` cookie.
 * @param session The {@link Session}
 * @param input The {@link SliderInput} containing required parameters for slider payload generation
 * @returns {Promise<{payload: string, headers: {[key: string]: string}}>} A {@link Promise} that resolves to an object containing the slider payload and response headers
 */
export function generateSliderPayload(session: Session, input: SliderInput): Promise<{ payload: string, headers: { [key: string]: string } }> {
    return sendRequestWithHeaders(session, "https://datadome.justhyped.dev/slider", input);
}
