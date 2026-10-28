import { generateKasadaDv } from "./dv";
import { KasadaPayloadInput } from "./payload";
import { generateKasadaUserAgent } from "./user_agent";

// A user-agent and dv built from one set of inputs, in the four-field form the i-2.x iOS SDK sends.
test("generateKasadaDv and generateKasadaUserAgent match the documented vector", () => {
    const device = {
        osVersion: "18.0.1",
        hardwareId: "iPhone13,2",
        bundleId: "com.example.app",
        appVersion: "9.15.0",
    };

    expect(generateKasadaDv(device)).toBe(
        "QkZWEmcDRUBEDloaAg8FDhpTAwhEGxFFWRFcQAVCVHFXFAlBUDRRDl8DBgABUxYUGkxERn0HDwNEVFxAFgZAVglAXV0dV0MTG0gbAEEWYVZfEl1XVg8OFA1NHAxIBxFQ",
    );
    expect(generateKasadaUserAgent(device)).toBe("7016adc4ba8d433533954ebad33be424");
});

test("KasadaPayloadInput sends dv only when set", () => {
    const base = ["ua", "https://example.com/ips.js", "script", "203.0.113.7", "en-US"] as const;
    expect(JSON.parse(JSON.stringify(new KasadaPayloadInput(...base)))).not.toHaveProperty("dv");
    expect(JSON.parse(JSON.stringify(new KasadaPayloadInput(...base, false, "abc"))).dv).toBe("abc");
});
