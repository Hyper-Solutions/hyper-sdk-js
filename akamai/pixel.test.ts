import {Session} from "../index";
import {generatePixelData, PixelInput} from "./pixel";

jest.mock('typed-rest-client/RestClient', () => {
    return {
        RestClient: jest.fn().mockImplementation(() => {
            return {
                create: jest.fn().mockImplementation(() => {
                    return Promise.resolve({
                        result: {
                            payload: "DummyPixelData"
                        },
                        statusCode: 200
                    });
                })
            };
        }),
    };
});

test("Test generatePixelData", async () => {
    const session = new Session("dummy");

    const data = await generatePixelData(
        session,
        new PixelInput(
            "Dummy User Agent",
            "",
            ""
        )
    );

    expect(data).toBe("DummyPixelData");
});
