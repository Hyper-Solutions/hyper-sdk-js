import { Session } from "../index";
import { sendPayloadRequest } from "../shared/api-client";

/**
 * Parses the required pixel challenge variable from the given HTML source code.
 * Returns `null` if the variable can't be found.
 * @param src The HTML source code
 */
export function parsePixelHtmlVar(src: string): number | null {
    const result = /bazadebezolkohpepadr="(\d+)"/.exec(src);
    if (result == null || result.length < 2) {
        return null;
    }

    return parseInt(result[1]);
}

/**
 * Pixel script URLs.
 */
export class PixelScriptUrls {
    /**
     * The URL of the pixel script.
     */
    public readonly scriptUrl: string;

    /**
     * The URL to make POST requests to.
     */
    public readonly postUrl: string;

    constructor(scriptUrl: string, postUrl: string) {
        this.scriptUrl = scriptUrl;
        this.postUrl = postUrl;
    }
}

/**
 * Parses the URL of the pixel challenge script, and generates the URL
 * to post a generated payload to from the given HTML source code.
 *
 * Returns null if the URL couldn't be found.
 * @param src The HTML source code
 * @returns {PixelScriptUrls} The generated URLs. Contains both script URL and post URL.
 */
export function parsePixelScriptUrl(src: string): PixelScriptUrls | null {
    const result = /src="(https?:\/\/.+\/akam\/\d+\/\w+)"/.exec(src);
    if (result == null || result.length < 2) {
        return null;
    }

    const scriptUrl = result[1];

    // Create post URL
    const parts = scriptUrl.split("/");
    parts[parts.length-1] = "pixel_" + parts[parts.length-1];
    const postUrl = parts.join("/");

    return new PixelScriptUrls(scriptUrl, postUrl);
}

/**
 * Gets the dynamic value from the pixel script.
 *
 * Returns null if the dynamic variable couldn't be found.
 * @param src The pixel script source code
 * @returns {string} The dynamic variable
 */
export function parsePixelScriptVar(src: string): string | null {
    const indexResult = /g=_\[(\d+)]/.exec(src);
    if (indexResult == null || indexResult.length < 2) {
        return null;
    }
    const index = parseInt(indexResult[1]);

    const arrayDeclaration = /var _=\[(.+?)];/.exec(src);
    if (arrayDeclaration == null || arrayDeclaration.length < 2) {
        return null;
    }

    const rawStrings = /("[^",]*")/.exec(arrayDeclaration[1]);
    if (rawStrings == null || index >= rawStrings.length) {
        return null;
    }

    // Remove leading and trailing quotes
    return rawStrings[index].replace(/^"|"$/g, "");
}

/**
 * Pixel API input.
 */
export class PixelInput {
    readonly userAgent: string;
    readonly htmlVar: string;
    readonly scriptVar: string;
    readonly ip: string;
    readonly acceptLanguage: string;

    /**
     * Creates a new instance.
     * @param userAgent The user agent to impersonate
     * @param htmlVar The HTML var, obtained from {@link parsePixelHtmlVar}
     * @param scriptVar The script var, obtained from {@link parsePixelScriptVar}
     * @param ip The IPV4 address of your network or proxy.
     * @param acceptLanguage Your accept-language header.
     */
    public constructor(userAgent: string, htmlVar: string, scriptVar: string, ip: string, acceptLanguage: string) {
        this.userAgent = userAgent;
        this.htmlVar = htmlVar;
        this.scriptVar = scriptVar;
        this.ip = ip;
        this.acceptLanguage = acceptLanguage;
    }
}

/**
 * Generates pixel data that can be used to obtain a valid `ak_bmsc` cookie.
 * @param session The {@link Session}
 * @param input The {@link PixelInput}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain the pixel data
 */
export async function generatePixelData(session: Session, input: PixelInput): Promise<string> {
    return sendPayloadRequest(session, "https://akm.hypersolutions.co/pixel", input);
}