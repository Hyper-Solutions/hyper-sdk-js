import {sendRequest} from "./api";
import {Session} from "../index";

/**
 * Reese84 API input.
 */
export class Reese84Input {
    readonly userAgent: string;
    readonly site: string;

    /**
     * Creates a new instance.
     * @param userAgent The user agent to impersonate
     * @param site The site identifier
     */
    public constructor(userAgent: string, site: string) {
        this.userAgent = userAgent;
        this.site = site;
    }
}

/**
 * Generates a reese84 sensor that can be used to obtain a valid `reese84` cookie.
 * @param session The {@link Session}
 * @param input The {@link Reese84Input}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain a reese84 sensor
 */
export async function generateReese84Sensor(session: Session, input: Reese84Input): Promise<string> {
    return sendRequest(session, "https://incapsula.justhyped.dev/reese84/" + input.site, input);
}
