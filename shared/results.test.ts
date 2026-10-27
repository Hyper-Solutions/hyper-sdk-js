// Runs the real generate* functions against canned API responses: undici's
// request is replaced, everything above it (request building, response
// parsing, result mapping) is the shipped code.
const mockRequest = jest.fn();
jest.mock("undici", () => ({
    request: (...args: any[]) => mockRequest(...args),
    Agent: class {},
    ProxyAgent: class {},
}));

import {
    Session, generateSensorData, generateSbsdPayload, generateReese84Sensor, generateKasadaPayload,
    generateInterstitialPayload, generateSliderPayload, generateTagsPayload, SensorInput, SbsdInput,
    KasadaPayloadInput, generateTelemetry, getTelemetryParams, TelemetryInput, TelemetryParamsInput,
} from "../index";

const HINTS = {
    "sec-ch-ua": '"Chromium";v="154"',
    "sec-ch-prefers-color-scheme": "dark",
    rtt: "150",
};

function respondWith(body: object) {
    mockRequest.mockImplementation(async () => ({
        statusCode: 200,
        headers: {},
        body: { arrayBuffer: async () => Buffer.from(JSON.stringify(body)) },
    }));
}

function sentBodies(): any[] {
    return mockRequest.mock.calls.map((call) => JSON.parse(Buffer.from(call[1].body).toString("utf8")));
}

const session = new Session("test-key");
const sensorInput = () => new SensorInput("", "", "3", "", "", "", "", "", "", "");
const sbsdInput = (scriptUrl = "") => new SbsdInput("", "", "", "", "", "", "", "", scriptUrl);
const kasadaInput = (strict = false) => new KasadaPayloadInput("", "", "", "", "", strict);
const telemetryInput = (context = "", j = "") =>
    new TelemetryInput("a", "b", "https://example.com/", "", "", "", context, "", "", j);

beforeEach(() => mockRequest.mockReset());

test("client hints reach every result that carries them", async () => {
    respondWith({ payload: "p", context: "c", headers: HINTS });

    expect(await generateSensorData(session, sensorInput())).toEqual({ payload: "p", context: "c", clientHints: HINTS });
    expect(await generateSbsdPayload(session, sbsdInput())).toEqual({ payload: "p", context: "c", clientHints: HINTS });
    expect(await generateTelemetry(session, telemetryInput())).toEqual({ header: "p", context: "c", clientHints: HINTS });
    expect((await generateReese84Sensor(session, {} as any)).clientHints).toEqual(HINTS);
    expect((await generateInterstitialPayload(session, {} as any)).clientHints).toEqual(HINTS);
    expect((await generateSliderPayload(session, {} as any)).clientHints).toEqual(HINTS);
    expect((await generateTagsPayload(session, {} as any)).clientHints).toEqual(HINTS);
});

test("Kasada keeps its x-kpsdk-* headers apart from the client hints", async () => {
    respondWith({
        payload: "dGwtYm9keQ==",
        headers: { "x-kpsdk-ct": "ct", "x-kpsdk-v": "j-1.0.0" },
        clientHints: { rtt: "100", "sec-ch-ua-wow64": "?0" },
    });

    const res = await generateKasadaPayload(session, kasadaInput());
    expect(res.payload).toBe("dGwtYm9keQ==");
    expect(res.headers).toEqual({ "x-kpsdk-ct": "ct", "x-kpsdk-v": "j-1.0.0" });
    expect(res.clientHints).toEqual({ rtt: "100", "sec-ch-ua-wow64": "?0" });
});

test("missing client hints are undefined", async () => {
    respondWith({ payload: "p" });
    expect((await generateReese84Sensor(session, {} as any)).clientHints).toBeUndefined();
});

test("strict and scriptUrl are only sent when set", async () => {
    respondWith({ payload: "p", context: "c", headers: {} });

    await generateKasadaPayload(session, kasadaInput());
    await generateKasadaPayload(session, kasadaInput(true));
    await generateSbsdPayload(session, sbsdInput());
    await generateSbsdPayload(session, sbsdInput("https://example.com/abc.js?v=1"));

    const [kasadaOff, kasadaOn, sbsdOff, sbsdOn] = sentBodies();
    expect(kasadaOff).not.toHaveProperty("strict");
    expect(kasadaOn.strict).toBe(true);
    expect(sbsdOff).not.toHaveProperty("scriptUrl");
    expect(sbsdOn.scriptUrl).toBe("https://example.com/abc.js?v=1");
});

test("telemetry sends the flat sensor request plus j, each method on its own endpoint", async () => {
    respondWith({ payload: "p", context: "c" });
    await generateTelemetry(session, telemetryInput("ctx", "AAQ%2f"));
    expect(mockRequest.mock.calls[0][0]).toBe("https://akm.hypersolutions.co/v1/telemetry");
    const [body] = sentBodies();
    expect(body).toMatchObject({ abck: "a", bmsz: "b", pageUrl: "https://example.com/", context: "ctx", j: "AAQ%2f" });

    mockRequest.mockReset();
    respondWith({ payload: "/_bm/get_params?type=web-jsto&v=aN+c/9=", context: "c" });
    const res = await getTelemetryParams(session, new TelemetryParamsInput("https://example.com/", "s"));
    expect(mockRequest.mock.calls[0][0]).toBe("https://akm.hypersolutions.co/v1/telemetry/params");
    // A script is sent as its hash first (see script_hash.test.ts).
    expect(sentBodies()[0]).toEqual({
        pageUrl: "https://example.com/", context: "",
        scriptHash: "043a718774c572bd8a25adbeb1bfcd5c0256ae11cecf9f9c3f925d0e52beaf89",
    });
    expect(res).toEqual({ path: "/_bm/get_params?type=web-jsto&v=aN+c/9=", context: "c" });
});

test("an API error still throws", async () => {
    respondWith({ error: "boom" });
    await expect(generateSensorData(session, sensorInput())).rejects.toThrow("boom");
});
