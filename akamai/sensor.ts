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
    readonly scriptHash?: string;

    /**
     * Creates a new instance.
     * @param abck The current `_abck` cookie
     * @param bmsz The current `bm_sz` cookie
     * @param version The Akamai web SDK version
     * @param pageUrl The URL of the page
     * @param userAgent The user agent to impersonate
     * @param scriptHash The hash of the script. This is an optional parameter that allows callers to
     * specify which version of the script they currently have, as not all nodes will be up-to-date
     * on Akamai's CDN when new updates are released. Refer to the
     * {@link https://docs.justhyped.dev/akamai-web/api-reference|documentation} for more information.
     */
    public constructor(abck: string, bmsz: string, version: string, pageUrl: string, userAgent: string, scriptHash?: string) {
        this.abck = abck;
        this.bmsz = bmsz;
        this.version = version;
        this.pageUrl = pageUrl;
        this.userAgent = userAgent;
        this.scriptHash = scriptHash;
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
