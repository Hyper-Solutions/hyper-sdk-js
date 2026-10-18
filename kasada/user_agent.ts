import { createHash } from "crypto";

/**
 * Input for {@link generateKasadaUserAgent}.
 */
export interface KasadaUserAgentInput {
    /** iOS: `UIDevice.systemVersion`, e.g. "18.0.1". Android: `Build.VERSION.SDK_INT`, e.g. "34". */
    osVersion: string;
    /** iOS: the app bundle id, e.g. "com.example.app". Android: the package name. */
    bundleId: string;
    /** The app version, e.g. "9.15.0". */
    appVersion: string;
}

/**
 * Generates the Kasada mobile `user-agent` value.
 *
 * The Kasada 2.x mobile SDK derives the `user-agent` header as the lowercase hex
 * MD5 of `"<osVersion> / <bundleId> <appVersion>"`.
 *
 * @param input The device OS version, app bundle id / package name, and app version.
 * @returns The lowercase hex MD5 `user-agent` value.
 */
export function generateKasadaUserAgent(input: KasadaUserAgentInput): string {
    const raw = `${input.osVersion} / ${input.bundleId} ${input.appVersion}`;
    return createHash("md5").update(raw).digest("hex");
}
