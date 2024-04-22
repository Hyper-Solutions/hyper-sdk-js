import {Session} from "../index";
import {sendRequest} from "./api";

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
 * @returns {[]string} The generated URL's. The first element is the script URL, and the second is the post URL.
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
 * @param src The HTML source code
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

    /**
     * Creates a new instance.
     * @param userAgent The user agent to impersonate
     * @param htmlVar The HTML var, obtained from {@link parsePixelHtmlVar}
     * @param scriptVar The script var, obtained from {@link parsePixelScriptVar}
     */
    public constructor(userAgent: string, htmlVar: string, scriptVar: string) {
        this.userAgent = userAgent;
        this.htmlVar = htmlVar;
        this.scriptVar = scriptVar;
    }
}

/**
 * Generates pixel data that can be used to obtain a valid `ak_bmsc` cookie.
 * @param session The {@link Session}
 * @param input The {@link PixelInput}
 */
export async function generatePixelData(session: Session, input: PixelInput): Promise<string> {
    return sendRequest(session, "https://akm.justhyped.dev/pixel", input);
}
