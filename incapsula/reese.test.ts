import {Session} from "../index";
import {generateReese84Sensor, Reese84Input} from "./reese";

jest.mock('typed-rest-client/RestClient', () => {
    return {
        RestClient: jest.fn().mockImplementation(() => {
            return {
                create: jest.fn().mockImplementation(() => {
                    return Promise.resolve({
                        result: {
                            payload: "DummyReese84Sensor"
                        },
                        statusCode: 200
                    });
                })
            };
        }),
    };
});

test("Test generateReese84Sensor", async () => {
    const session = new Session("dummy");

    const payload = await generateReese84Sensor(
        session,
        new Reese84Input(
            "Dummy User Agent",
            "Example Site"
        )
    );

    expect(payload).toBe("DummyReese84Sensor");
});
