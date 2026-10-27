import {Session} from "../index.js";
import type { TelemetryResult, TelemetryParamsResult } from "../shared/results.js";
import {sendScriptRequest, IPayloadWithContextResponse, InvalidApiResponseError} from "../shared/api-client.js";
import {SensorInput} from "./sensor.js";

/**
 * Akamai-BM-Telemetry input: a sensor request for a site that sends the header on its protected API calls instead
 * of posting sensor data, plus the get_params `j`. Only v3 dynamic scripts send the header, so there is no version.
 */
export class TelemetryInput extends SensorInput {
    readonly j: string;

    /**
     * Creates a new instance.
     * @param abck The current `_abck` cookie.
     * @param bmsz The current `bm_sz` cookie.
     * @param pageUrl The URL of the page.
     * @param userAgent The user agent to impersonate.
     * @param ip The IPV4 address of your network or proxy.
     * @param acceptLanguage Your accept-language header.
     * @param context Empty on the first header (or the context from {@link getTelemetryParams}), the context from the last telemetry response on subsequent headers.
     * @param script Mutually exclusive with context: the first request sends the script, later ones only the context.
     * @param scriptUrl The URL of the script.
     * @param j The `j` from the response of the site's get_params request (see {@link getTelemetryParams}), sent as it was returned. Empty when the site makes no get_params request.
     */
    public constructor(abck: string, bmsz: string, pageUrl: string, userAgent: string, ip: string, acceptLanguage: string, context: string, script: string, scriptUrl: string, j: string = "") {
        super(abck, bmsz, "", pageUrl, userAgent, ip, acceptLanguage, context, script, scriptUrl);
        this.j = j;
    }
}

/**
 * Input for {@link getTelemetryParams}.
 */
export class TelemetryParamsInput {
    readonly pageUrl: string;
    readonly script: string;
    readonly context: string;

    /**
     * Creates a new instance.
     * @param pageUrl The URL of the page that loaded the akamai script.
     * @param script The akamai script, mutually exclusive with context.
     * @param context A context returned by an earlier telemetry or telemetry params request, mutually exclusive with script.
     */
    public constructor(pageUrl: string, script: string = "", context: string = "") {
        this.pageUrl = pageUrl;
        this.script = script;
        this.context = context;
    }
}

/**
 * Generates the value of the Akamai-BM-Telemetry header that the site's protected API calls carry. Each protected
 * call takes a fresh header built from the previous call's context.
 * @param session The {@link Session}
 * @param input The {@link TelemetryInput}
 * @returns {Promise<TelemetryResult>} A {@link Promise} that, when resolved, will contain the header value, context and client hints
 */
export async function generateTelemetry(session: Session, input: TelemetryInput): Promise<TelemetryResult> {
    const response = await sendScriptRequest<TelemetryInput, IPayloadWithContextResponse>(
        session,
        "https://akm.hypersolutions.co/v1/telemetry",
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
        header: response.payload!,
        context: response.context!,
        clientHints: response.headers
    };
}

/**
 * Returns the path of the site's get_params request, whose response carries the `j` for {@link TelemetryInput}, and
 * a context that can replace the script on the first telemetry request.
 * @param session The {@link Session}
 * @param input The {@link TelemetryParamsInput}
 * @returns {Promise<TelemetryParamsResult>} A {@link Promise} that, when resolved, will contain the get_params path and a context
 */
export async function getTelemetryParams(session: Session, input: TelemetryParamsInput): Promise<TelemetryParamsResult> {
    const response = await sendScriptRequest<TelemetryParamsInput, IPayloadWithContextResponse>(
        session,
        "https://akm.hypersolutions.co/v1/telemetry/params",
        input,
        (res) => {
            if (!res.payload) {
                throw new InvalidApiResponseError("No payload obtained from API");
            }
        }
    );

    return {
        path: response.payload!,
        context: response.context ?? ""
    };
}
