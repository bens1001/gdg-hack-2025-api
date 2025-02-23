import { Errors, ServiceBroker, type ServiceSchema } from "moleculer";

import TestService from "../../../services/skill.service";

const { ValidationError } = Errors;

describe("Test 'skill' service", () => {
    const broker = new ServiceBroker({ logger: false });
    broker.createService(TestService as unknown as ServiceSchema);

    beforeAll(async () => broker.start());
    afterAll(async () => broker.stop());

    describe("Test 'skill.hello' action", () => {
        it("should return with 'Hello Moleculer'", async () => {
            const response = await broker.call("skill.hello");
            expect(response).toBe("Hello Moleculer");
        });
    });

    describe("Test 'skill.welcome' action", () => {
        it("should return with 'Welcome'", async () => {
            const response = await broker.call("skill.welcome", {
                name: "Adam",
            });
            expect(response).toBe("Welcome, Adam");
        });

        it("should reject an ValidationError", async () => {
            expect.assertions(1);
            try {
                await broker.call("skill.welcome");
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(ValidationError);
            }
        });
    });
});
