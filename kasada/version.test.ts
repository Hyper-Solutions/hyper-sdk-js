// Runs getKasadaVersion against canned API responses: undici's request is
// replaced, everything above it is the shipped code.
const mockRequest = jest.fn();
jest.mock("undici", () => ({
    request: (...args: any[]) => mockRequest(...args),
    Agent: class {},
    ProxyAgent: class {},
}));

import { Session, getKasadaVersion, KasadaVersionInput } from "../index";

function respondWith(status: number, body: object) {
    mockRequest.mockImplementation(async () => ({
        statusCode: status,
        headers: {},
        body: { arrayBuffer: async () => Buffer.from(JSON.stringify(body)) },
    }));
}

const session = new Session("test-key");
const SCRIPT = "KPSDK.scriptStart=KPSDK.now();";

beforeEach(() => mockRequest.mockReset());

test("sends the page URL and the script as-is, and returns the payload as the version", async () => {
    respondWith(200, { payload: "j-1.2.797" });
    const input = new KasadaVersionInput("https://example.com/", SCRIPT);
    const res = await getKasadaVersion(session, input);

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest.mock.calls[0][0]).toBe("https://kasada.hypersolutions.co/version");
    const body = JSON.parse(Buffer.from(mockRequest.mock.calls[0][1].body).toString("utf8"));
    expect(body).toEqual({ pageUrl: "https://example.com/", script: SCRIPT });
    expect(res).toEqual({ version: "j-1.2.797" });
});

test("an API error throws", async () => {
    respondWith(400, { error: "invalid script" });
    await expect(getKasadaVersion(session, new KasadaVersionInput("https://example.com/", SCRIPT)))
        .rejects.toThrow("invalid script");
    expect(mockRequest).toHaveBeenCalledTimes(1);
});

test("a script_required answer is not retried", async () => {
    respondWith(422, { error: "script_required" });
    await expect(getKasadaVersion(session, new KasadaVersionInput("https://example.com/", SCRIPT)))
        .rejects.toThrow("script_required");
    expect(mockRequest).toHaveBeenCalledTimes(1);
});

test("a response without a payload throws", async () => {
    respondWith(200, {});
    await expect(getKasadaVersion(session, new KasadaVersionInput("https://example.com/", SCRIPT)))
        .rejects.toThrow("No payload obtained from API");
});
