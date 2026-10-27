// Runs the real generate* functions against a fake API: undici's request is
// replaced by a server that knows a set of script hashes and answers 422
// script_required for any other.
import { createHash } from "crypto";

const mockRequest = jest.fn();
jest.mock("undici", () => ({
    request: (...args: any[]) => mockRequest(...args),
    Agent: class {},
    ProxyAgent: class {},
}));

import {
    Session, generateSensorData, generateSbsdPayload, generateReese84Sensor, generateInterstitialPayload,
    generateSliderPayload, generateTelemetry, getTelemetryParams, SensorInput, SbsdInput, TelemetryInput,
    TelemetryParamsInput, Reese84Input, InterstitialInput, SliderInput,
} from "../index";

const SCRIPT = "(function(){var a='é中';})();";
const HASH = createHash("sha256").update(Buffer.from(SCRIPT, "utf8")).digest("hex");

type Reply = { status: number; body: object };

function reply(status: number, body: object) {
    return {
        statusCode: status,
        headers: {},
        body: { arrayBuffer: async () => Buffer.from(JSON.stringify(body)) },
    };
}

// A fake API: a request with a known scriptHash, or with a script, gets the
// success reply; an unknown hash gets 422 script_required. A script it is sent
// becomes known.
function fakeApi(known: string[], success: Reply = { status: 200, body: { payload: "p", context: "c" } }) {
    const hashes = new Set(known);
    mockRequest.mockImplementation(async (_url: string, opts: any) => {
        const body = JSON.parse(Buffer.from(opts.body).toString("utf8"));
        if (body.scriptHash !== undefined && body.script !== undefined) {
            return reply(400, { error: "script and scriptHash are mutually exclusive" });
        }
        if (body.scriptHash !== undefined && !hashes.has(body.scriptHash)) {
            return reply(422, { error: "script_required" });
        }
        if (body.script) {
            hashes.add(createHash("sha256").update(body.script, "utf8").digest("hex"));
        }
        return reply(success.status, success.body);
    });
}

// Replies in order, one per request.
function replies(...list: Reply[]) {
    for (const r of list) {
        mockRequest.mockImplementationOnce(async () => reply(r.status, r.body));
    }
}

function sentBodies(): any[] {
    return mockRequest.mock.calls.map((call) => JSON.parse(Buffer.from(call[1].body).toString("utf8")));
}

function withoutScript(input: object): object {
    const { script, ...rest } = input as any;
    return { ...rest, scriptHash: HASH };
}

const session = new Session("test-key");
const sensorInput = (script = SCRIPT, context = "") =>
    new SensorInput("abck", "bmsz", "3", "https://example.com/", "ua", "1.2.3.4", "en", context, script, "https://example.com/s.js");
const sbsdInput = (script = SCRIPT, context = "") =>
    new SbsdInput("uuid", "o", "https://example.com/", "ua", script, "1.2.3.4", "en", context, "https://example.com/sbsd.js?v=1");
const reeseInput = () => new Reese84Input("ua", "1.2.3.4", "en", "https://example.com/", SCRIPT, "https://example.com/r.js");
const interstitialInput = (script?: string) =>
    new InterstitialInput("ua", "https://geo.captcha-delivery.com/interstitial/", "<html>", "1.2.3.4", "en", script);
const sliderInput = () =>
    new SliderInput("ua", "https://geo.captcha-delivery.com/captcha/", "<html>", "puzzle", "piece", "https://example.com/", "1.2.3.4", "en", SCRIPT);

// Every call that takes a script, with the endpoint it must reach.
const calls: [string, string, () => object, (input: any) => Promise<unknown>][] = [
    ["sensor", "https://akm.hypersolutions.co/v2/sensor", () => sensorInput(), (i) => generateSensorData(session, i)],
    ["telemetry", "https://akm.hypersolutions.co/v1/telemetry",
        () => new TelemetryInput("a", "b", "https://example.com/", "ua", "1.2.3.4", "en", "", SCRIPT, "", "j"),
        (i) => generateTelemetry(session, i)],
    ["telemetry params", "https://akm.hypersolutions.co/v1/telemetry/params",
        () => new TelemetryParamsInput("https://example.com/", SCRIPT), (i) => getTelemetryParams(session, i)],
    ["sbsd", "https://akm.hypersolutions.co/sbsd", () => sbsdInput(), (i) => generateSbsdPayload(session, i)],
    ["reese84", "https://incapsula.hypersolutions.co/reese84", reeseInput, (i) => generateReese84Sensor(session, i)],
    ["interstitial", "https://datadome.hypersolutions.co/interstitial", () => interstitialInput(SCRIPT),
        (i) => generateInterstitialPayload(session, i)],
    ["slider", "https://datadome.hypersolutions.co/slider", sliderInput, (i) => generateSliderPayload(session, i)],
];

beforeEach(() => mockRequest.mockReset());

test("the hash is the lowercase hex sha256 of the script's UTF-8 bytes", async () => {
    fakeApi([HASH]);
    await generateSensorData(session, sensorInput());
    expect(sentBodies()[0].scriptHash).toBe(HASH);
    expect(HASH).toMatch(/^[0-9a-f]{64}$/);
});

describe.each(calls)("%s", (_name, url, makeInput, call) => {
    test("an unseen script sends the hash, then the script", async () => {
        fakeApi([]);
        const input = makeInput();
        await call(input);

        expect(mockRequest.mock.calls.map((c) => c[0])).toEqual([url, url]);
        const [hashed, full] = sentBodies();
        expect(hashed).toEqual(withoutScript(input));
        expect(hashed).not.toHaveProperty("script");
        expect(full).toEqual(JSON.parse(JSON.stringify(input)));
        expect(full.script).toBe(SCRIPT);
        expect(full).not.toHaveProperty("scriptHash");
    });

    test("a known hash sends only the hash", async () => {
        fakeApi([HASH]);
        const input = makeInput();
        await call(input);

        expect(mockRequest).toHaveBeenCalledTimes(1);
        expect(sentBodies()[0]).toEqual(withoutScript(input));
    });

    test("the caller's input is unchanged", async () => {
        fakeApi([]);
        const input = makeInput();
        const before = JSON.stringify(input);
        await call(input);
        expect(JSON.stringify(input)).toBe(before);
        expect((input as any).script).toBe(SCRIPT);
        expect(input).not.toHaveProperty("scriptHash");
    });
});

test("the script reaches the API once; later calls send only the hash", async () => {
    fakeApi([]);
    await generateSensorData(session, sensorInput());
    await generateSensorData(session, sensorInput());
    const bodies = sentBodies();
    expect(bodies.map((b) => [b.script !== undefined, b.scriptHash !== undefined])).toEqual([
        [false, true], [true, false], [false, true],
    ]);
});

test("a 422 then a 200 returns the 200's result", async () => {
    replies(
        { status: 422, body: { error: "script_required" } },
        { status: 200, body: { payload: "p2", context: "c2", headers: { rtt: "50" } } },
    );
    const res = await generateSbsdPayload(session, sbsdInput());
    expect(res).toEqual({ payload: "p2", context: "c2", clientHints: { rtt: "50" } });
    expect(mockRequest).toHaveBeenCalledTimes(2);
});

test("an error answer after the script is sent is thrown", async () => {
    replies(
        { status: 422, body: { error: "script_required" } },
        { status: 400, body: { error: "invalid script" } },
    );
    await expect(generateReese84Sensor(session, reeseInput())).rejects.toThrow("invalid script");
    expect(mockRequest).toHaveBeenCalledTimes(2);
});

test("a second script_required after the script is sent is thrown, not retried", async () => {
    replies(
        { status: 422, body: { error: "script_required" } },
        { status: 422, body: { error: "script_required" } },
    );
    await expect(generateSensorData(session, sensorInput())).rejects.toThrow("script_required");
    expect(mockRequest).toHaveBeenCalledTimes(2);
});

test("any other answer to the hashed request is handled as before, without a retry", async () => {
    replies({ status: 400, body: { error: "bad input" } });
    await expect(generateSensorData(session, sensorInput())).rejects.toThrow("bad input");
    expect(mockRequest).toHaveBeenCalledTimes(1);

    mockRequest.mockReset();
    replies({ status: 422, body: { error: "something else" } });
    await expect(generateInterstitialPayload(session, interstitialInput(SCRIPT))).rejects.toThrow("something else");
    expect(mockRequest).toHaveBeenCalledTimes(1);

    mockRequest.mockReset();
    replies({ status: 500, body: {} });
    await expect(generateSbsdPayload(session, sbsdInput())).rejects.toThrow("Bad HTTP status code 500");
    expect(mockRequest).toHaveBeenCalledTimes(1);

    mockRequest.mockReset();
    replies({ status: 200, body: {} });
    await expect(generateSensorData(session, sensorInput())).rejects.toThrow("No payload obtained from API");
    expect(mockRequest).toHaveBeenCalledTimes(1);
});

test("requests with an empty script are sent unchanged", async () => {
    fakeApi([]);
    const sensor = sensorInput("", "ctx");
    const sbsd = sbsdInput("", "ctx");
    const params = new TelemetryParamsInput("https://example.com/", "", "ctx");
    const interstitial = interstitialInput();
    await generateSensorData(session, sensor);
    await generateSbsdPayload(session, sbsd);
    await getTelemetryParams(session, params);
    await generateInterstitialPayload(session, interstitial);

    expect(mockRequest).toHaveBeenCalledTimes(4);
    const bodies = sentBodies();
    expect(bodies).toEqual([sensor, sbsd, params, interstitial].map((i) => JSON.parse(JSON.stringify(i))));
    for (const body of bodies) {
        expect(body).not.toHaveProperty("scriptHash");
        expect(body.script ?? "").toBe("");
    }
    expect(bodies[0].context).toBe("ctx");
    expect(bodies[1].context).toBe("ctx");
});

test("the hashed body keeps every other input field", async () => {
    fakeApi([HASH]);
    await generateSensorData(session, sensorInput());
    expect(sentBodies()[0]).toEqual({
        abck: "abck", bmsz: "bmsz", version: "3", pageUrl: "https://example.com/", userAgent: "ua",
        ip: "1.2.3.4", acceptLanguage: "en", context: "", scriptUrl: "https://example.com/s.js", scriptHash: HASH,
    });
});
