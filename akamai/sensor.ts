import {Session} from "../index";
import {sendRequest, IPayloadWithContextResponse, InvalidApiResponseError} from "../shared/api-client";

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
    readonly context: string;
    readonly script: string;
    readonly scriptUrl: string;

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
     * @param context Empty on first sensor, context from last sensor response on subsequent sensors.
     * @param script Script is mutually exclusive with [SensorInput.Context], the first sensor request should include the script field. Subsequent request should only include the Context.
     * @param scriptUrl The URL of the script.
     */
    public constructor(abck: string, bmsz: string, version: string, pageUrl: string, userAgent: string, ip: string, acceptLanguage: string, context: string, script: string, scriptUrl: string) {
        this.abck = abck;
        this.bmsz = bmsz;
        this.version = version;
        this.pageUrl = pageUrl;
        this.userAgent = userAgent;
        this.ip = ip;
        this.acceptLanguage = acceptLanguage;
        this.script = script;
        this.scriptUrl = scriptUrl;
        this.context = context;
    }
}

/**
 * Generates sensor data that can be used to obtain a valid `_abck` cookie.
 * @param session The {@link Session}
 * @param input The {@link SensorInput}
 * @returns {Promise<{payload: string, context: string}>} A {@link Promise} that, when resolved, will contain sensor data and context
 */
export async function generateSensorData(session: Session, input: SensorInput): Promise<{
    payload: string,
    context: string
}> {
    const response = await sendRequest<SensorInput, IPayloadWithContextResponse>(
        session,
        "https://akm.hypersolutions.co/v2/sensor",
        input,
        (res) => {
            if (!res.payload) {
                throw new InvalidApiResponseError("No payload obtained from API");
            }
            if (!res.context) {
                throw new InvalidApiResponseError("No context obtained from API");
            }
        }
    );

    return {
        payload: response.payload!,
        context: response.context!
    };
}