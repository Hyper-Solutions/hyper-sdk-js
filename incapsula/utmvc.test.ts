import {Session} from "../index";
import {generateUtmvcCookie, UtmvcInput} from "./utmvc";

jest.mock('typed-rest-client/RestClient', () => {
    return {
        RestClient: jest.fn().mockImplementation(() => {
            return {
                create: jest.fn().mockImplementation(() => {
                    return Promise.resolve({
                        result: {
                            payload: "DummyUtmvcCookie"
                        },
                        statusCode: 200
                    });
                })
            };
        }),
    };
});

test("Test generateUtmvcCookie", async () => {
    const session = new Session("dummy");

    const payload = await generateUtmvcCookie(
        session,
        new UtmvcInput(
            "Dummy User Agent",
            "(function(){console.log('Hello world')})()",
            []
        )
    );

    expect(payload).toBe("DummyUtmvcCookie");
});
