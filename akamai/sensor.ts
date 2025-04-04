import {Session} from "../index";
import {sendRequest} from "./api";

/**
 * Sensor data input.
 */
export class SensorInput {
    readonly abck: string;
    readonly bmsz: string;
    readonly version: string;
    readonly pageUrl: string;
    readonly userAgent: string;
    readonly ip: string;
    readonly acceptLanguage: string;
    readonly scriptHash?: string;
    readonly dynamicValues?: string;

    /**
     * Creates a new instance.
     * Refer to the {@link https://docs.justhyped.dev/api-reference/akamai|documentation} for more information.
     * @param abck The current `_abck` cookie.
     * @param bmsz The current `bm_sz` cookie.
     * @param version The Akamai web SDK version.
     * @param pageUrl The URL of the page.
     * @param userAgent The user agent to impersonate.
     * @param ip The IPV4 address of your network or proxy.
     * @param acceptLanguage Your accept-language header.
     * @param scriptHash The hash of the script, optional.
     * @param dynamicValues The dynamic values required for v3 dynamic version.
     */
    public constructor(abck: string, bmsz: string, version: string, pageUrl: string, userAgent: string, ip: string, acceptLanguage: string, scriptHash?: string, dynamicValues?: string) {
        this.abck = abck;
        this.bmsz = bmsz;
        this.version = version;
        this.pageUrl = pageUrl;
        this.userAgent = userAgent;
        this.scriptHash = scriptHash;
        this.ip = ip;
        this.acceptLanguage = acceptLanguage;
        this.dynamicValues = dynamicValues;
    }
}

/**
 * Generates sensor data that can be used to obtain a valid `_abck` cookie.
 * @param session The {@link Session}
 * @param input The {@link SensorInput}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain sensor data
 */
export async function generateSensorData(session: Session, input: SensorInput): Promise<string> {
    return sendRequest(session, "https://akm.justhyped.dev/sensor", input);
}
