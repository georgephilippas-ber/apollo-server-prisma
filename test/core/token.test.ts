import {Manager_jwt} from "../../src/core/authentication/token/token";

describe("Manager_jwt", () =>
{
    let manager_jwt_ = new Manager_jwt();

    let jwt_ = manager_jwt_.produce({agentId: Math.random(), refresh: true});

    it("jwt_ !empty", () =>
    {
        expect(jwt_).toBeTruthy();
    });

    let payload_ = manager_jwt_.obtain(jwt_);

    it("typeof payload_ === authentication_payload_type_", () =>
    {
        expect(payload_).toHaveProperty("agentId");
        expect(payload_).toHaveProperty("refresh");
    });
});
