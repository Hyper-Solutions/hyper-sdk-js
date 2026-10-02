import { Session } from "../index.js";
import { sendRequest, IPayloadWithContextResponse, InvalidApiResponseError } from "../shared/api-client.js";

/**
 * Sbsd input.
 */
export class SbsdInput {
    readonly index: number;
    readonly userAgent: string;
    readonly uuid: string;
    readonly pageUrl: string;
    readonly o: string;
    readonly script: string;
    readonly ip: string;
    readonly acceptLanguage: string;
    readonly context: string;

    /**
     * Creates a new instance.
     * Refer to the {@link https://docs.hypersolutions.co/akamai-web/api-reference|documentation} for more information.
     * @param index The index value
     * @param uuid The uuid of the sbsd challenge (https://example.com/.well-known/sbsd?v=dcc78710-14fe-3835-cc6e-b9b5ea3b6010). uuid is dcc78710-14fe-3835-cc6e-b9b5ea3b6010 on this url.
     * @param o_cookie The "sbsd_o" cookie value
     * @param pageUrl The URL of the page
     * @param userAgent The user agent to impersonate
     * @param script The script content. Mutually exclusive with context: the first sbsd request should include script, subsequent requests should only include context.
     * @param ip The IPV4 address of your network or proxy.
     * @param acceptLanguage Your accept-language header.
     * @param context The context returned by the previous sbsd request. Leave empty on the first request.
     */
    public constructor(index: number, uuid: string, o_cookie: string, pageUrl: string, userAgent: string, script: string, ip: string, acceptLanguage: string, context: string = "") {
        this.index = index;
        this.uuid = uuid;
        this.pageUrl = pageUrl;
        this.userAgent = userAgent;
        this.o = o_cookie;
        this.script = script;
        this.ip = ip;
        this.acceptLanguage = acceptLanguage;
        this.context = context;
    }
}

/**
 * Generates SBSD data that can be used to obtain a valid `sbsd` cookie.
 * @param session The {@link Session}
 * @param input The {@link SbsdInput}
 * @returns {Promise<{payload: string, context: string}>} A {@link Promise} that, when resolved, will contain sbsd sensor data and context
 */
export async function generateSbsdPayload(session: Session, input: SbsdInput): Promise<{
    payload: string,
    context: string
}> {
    const response = await sendRequest<SbsdInput, IPayloadWithContextResponse>(
        session,
        "https://akm.hypersolutions.co/sbsd",
        input,
        (res) => {
            if (!res.payload) {
                throw new InvalidApiResponseError("No payload obtained from API");
            }
        }
    );

    return {
        payload: response.payload!,
        // Absent when the request carried no context, which the index-only
        // flow still does. Unlike the sensor, sbsd does not always return one.
        context: response.context ?? ""
    };
}