import {Session} from "../index";
import {generateSensorData, SensorInput} from "./sensor";

jest.mock('typed-rest-client/RestClient', () => {
    return {
        RestClient: jest.fn().mockImplementation(() => {
            return {
                create: jest.fn().mockImplementation(() => {
                    return Promise.resolve({
                        result: {
                            payload: "DummySensorData"
                        },
                        statusCode: 200
                    });
                })
            };
        }),
    };
});

test("Test generateSensorData", async () => {
    const session = new Session("dummy");

    const payload = await generateSensorData(
        session,
        new SensorInput(
            "dummy",
            "dummy",
            "2",
            "https://www.example.com/",
            "Dummy User Agent"
        )
    );

    expect(payload).toBe("DummySensorData");
});
