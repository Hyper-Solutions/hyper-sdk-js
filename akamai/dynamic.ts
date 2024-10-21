import {Session} from "../index";
import {sendRequest} from "./api";

/**
 * V3DynamicInput input.
 */
export class V3DynamicInput {
    readonly script: string;

    /**
     * Creates a new instance.
     * Refer to the {@link https://docs.justhyped.dev/akamai-web/api-reference|documentation} for more information.
     * @param script The Akamai script content
     */
    public constructor(script: string) {
        this.script = script;
    }
}

/**
 * Parses v3 dynamic script data that can be used to generate sensor data for this version.
 * @param session The {@link Session}
 * @param input The {@link SbsdInput}
 * @returns {Promise<string>} A {@link Promise} that, when resolved, will contain the dynamic values
 */
export async function parseV3DynamicValues(session: Session, input: V3DynamicInput): Promise<string> {
    return sendRequest(session, "https://akm.justhyped.dev/v3dynamic", input);
}
