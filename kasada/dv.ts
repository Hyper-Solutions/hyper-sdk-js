import type { KasadaUserAgentInput } from "./user_agent.js";

/** The key the Kasada iOS SDK XORs the `x-kpsdk-dv` header with. */
const DV_KEY = Buffer.from("9d9a1f73-a488-464c-9f73-8c87d018363c");

/**
 * Input for {@link generateKasadaDv}: the {@link KasadaUserAgentInput} values plus the model,
 * so one object builds a matching `user-agent` and `x-kpsdk-dv`.
 */
export interface KasadaDvInput extends KasadaUserAgentInput {
    /** The model identifier from `utsname.machine`, e.g. "iPhone13,2" for an iPhone 12, not the marketing name. */
    hardwareId: string;
}

/**
 * Generates the `x-kpsdk-dv` header value the Kasada iOS SDK (i-2.x) sends.
 *
 * The value is base64 of `{"osVersion","hardwareId","appId","appVersion"}` XORed with a key
 * fixed in the SDK; `appId` is the `bundleId`. Send the same value as the `dv` of
 * {@link KasadaPayloadInput}, so the payload is generated on a device with that model's screen
 * and iOS release.
 *
 * @param input The iOS version, model identifier, app bundle id and app version.
 * @returns The `x-kpsdk-dv` header value.
 */
export function generateKasadaDv(input: KasadaDvInput): string {
    const plain = Buffer.from(JSON.stringify({
        osVersion: input.osVersion,
        hardwareId: input.hardwareId,
        appId: input.bundleId,
        appVersion: input.appVersion,
    }));
    const key = DV_KEY.subarray(0, plain.length);
    return Buffer.from(plain.map((b, i) => b ^ key[i % key.length])).toString("base64");
}
