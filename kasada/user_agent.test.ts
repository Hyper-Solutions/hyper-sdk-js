import { generateKasadaUserAgent } from "./user_agent";

test("generateKasadaUserAgent matches the documented example vector", () => {
    const ua = generateKasadaUserAgent({
        osVersion: "18.0.1",
        bundleId: "com.example.app",
        appVersion: "9.15.0",
    });

    expect(ua).toBe("7016adc4ba8d433533954ebad33be424");
});
