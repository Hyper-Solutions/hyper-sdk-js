// Runs getUsage against canned API responses: undici's request is replaced,
// everything above it is the shipped code.
const mockRequest = jest.fn();
jest.mock("undici", () => ({
    request: (...args: any[]) => mockRequest(...args),
    Agent: class {},
    ProxyAgent: class {},
}));

import { Session, getUsage } from "../index";

function respondWith(status: number, body: object) {
    mockRequest.mockImplementation(async () => ({
        statusCode: status,
        headers: {},
        body: { arrayBuffer: async () => Buffer.from(JSON.stringify(body)) },
    }));
}

const session = new Session("test-key");
const PLAN = {
    expiresAt: "2027-07-31T00:00:00Z",
    requestsUsed: 44235934,
    requestsQuota: 9999999999,
    requestsRemaining: 9955764065,
    product: "akamai",
};

beforeEach(() => mockRequest.mockReset());

test("sends a GET without a body and returns the balance and the plans", async () => {
    respondWith(200, { balanceEuro: 12.5, plans: [PLAN] });
    const res = await getUsage(session);

    expect(mockRequest).toHaveBeenCalledTimes(1);
    const [url, options] = mockRequest.mock.calls[0];
    expect(url).toBe("https://api.hypersolutions.co/usage");
    expect(options.method).toBe("GET");
    expect(options.body).toBeUndefined();
    expect(options.headers["X-Api-Key"]).toBe("test-key");
    expect(options.headers["Content-Type"]).toBeUndefined();
    expect(res).toEqual({ balanceEuro: 12.5, plans: [PLAN] });
});

test("an invalid key throws the API error", async () => {
    respondWith(403, { error: "Invalid API key" });
    await expect(getUsage(session)).rejects.toThrow("Invalid API key");
});

test("a response without usage throws", async () => {
    respondWith(200, {});
    await expect(getUsage(session)).rejects.toThrow("No usage obtained from API");
});
