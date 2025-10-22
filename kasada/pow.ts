import { Session } from "../index";
import { sendPayloadRequest } from "../shared/api-client";

/**
 * Input for Kasada Proof of Work calculation.
 */
export class KasadaPowInput {
    /**
     * The x-kpsdk-st value returned by the /tl POST request.
     */
    st: number;
    /**
     * The x-kpsdk-ct value returned by the /tl POST request.
     */
    ct: string;
    /**
     * The x-kpsdk-fc value returned by the /mfc GET request, if used on the site.
     */
    fc?: string;
    /**
     * The domain.
     */
    domain: string;

    /**
     * Can be used to pre-generate POW strings.
     * This field is optional.
     */
    workTime?: number;

    /**
     * Creates a new instance of KasadaPowInput.
     * @param st The x-kpsdk-st value returned by the /tl POST request.
     * @param ct The x-kpsdk-ct value returned by the /tl POST request.
     * @param domain The domain.
     * @param fc Optional. The x-kpsdk-fc value returned by the /mfc GET request.
     * @param workTime Optional. Can be used to pre-generate POW strings.
     */
    constructor(st: number, ct: string, domain: string, fc?: string, workTime?: number) {
        this.st = st;
        this.ct = ct;
        this.domain = domain;
        if (workTime !== undefined) {
            this.workTime = workTime;
        }
        if (fc !== undefined) {
            this.fc = fc;
        }
    }
}

/**
 * Generates Kasada POW (x-kpsdk-cd).
 * @param session The {@link Session}
 * @param input The {@link KasadaPowInput}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain the x-kpsdk-cd token.
 */
export async function generateKasadaPow(session: Session, input: KasadaPowInput): Promise<string> {
    return sendPayloadRequest(session, "https://kasada.hypersolutions.co/cd", input);
}