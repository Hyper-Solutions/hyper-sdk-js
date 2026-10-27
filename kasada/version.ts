import { Session } from "../index.js";
import type { KasadaVersionResult } from "../shared/results.js";
import { sendRequest, IPayloadResponse, InvalidApiResponseError } from "../shared/api-client.js";

/**
 * Kasada version input.
 */
export class KasadaVersionInput {
    readonly pageUrl: string;
    readonly script: string;

    /**
     * Creates a new instance.
     * @param pageUrl The URL of the page that loaded the p.js script.
     * @param script The p.js script body.
     */
    public constructor(pageUrl: string, script: string) {
        this.pageUrl = pageUrl;
        this.script = script;
    }
}

/**
 * Returns the x-kpsdk-v value of a site's p.js. It is a helper and is not counted as usage.
 * @param session The {@link Session}
 * @param input The {@link KasadaVersionInput}
 * @returns {Promise<KasadaVersionResult>} A {@link Promise} that, when resolved, will contain the x-kpsdk-v value
 */
export async function getKasadaVersion(session: Session, input: KasadaVersionInput): Promise<KasadaVersionResult> {
    const response = await sendRequest<KasadaVersionInput, IPayloadResponse>(
        session,
        "https://kasada.hypersolutions.co/version",
        input,
        (res) => {
            if (!res.payload) {
                throw new InvalidApiResponseError("No payload obtained from API");
            }
        }
    );

    return {
        version: response.payload!
    };
}
