import {jwtAuthorizationPayload_type, JwtManager} from "../../src/core/authorization/jwt-manager/jwt-manager";
import {faker} from "@faker-js/faker";
import {isolate} from "../../src/core/utilities/utilities";

describe("jwtManager", () =>
{
    let jwtManager = new JwtManager();

    let authorizationPayload: jwtAuthorizationPayload_type =
        {
            agentId: -1,
            sessionId: -1,
            canRefresh: true
        }

    it("valid", () =>
    {
        let jwt_token_ = jwtManager.produce(authorizationPayload);
        let decode_ = jwtManager.decode(jwt_token_);

        console.log(decode_.payload);

        expect(decode_.isAuthorizationPayload).toBeTruthy();
        expect(decode_.hasValidSignature).toBeTruthy();
        expect(isolate(decode_.payload, Object.keys(authorizationPayload))).toEqual(authorizationPayload);
    });

    it("invalid", () =>
    {
        let jwt_token_ = faker.datatype.string(0xff); //jwtManager.produce({agentId: Math.random(), refresh: true});
        let decode_ = jwtManager.decode(jwt_token_);

        expect(decode_.isAuthorizationPayload).toBeFalsy();
        expect(decode_.hasValidSignature).toBeFalsy();
    });

    // it("expired", () =>
    // {
    //     let jwt_token_ = jwtManager.produce({agentId: Math.random(), refresh: true}, 0);
    //     let decode_ = jwtManager.decode(jwt_token_);
    //
    //     expect(decode_.hasValidSignature).toBeFalsy();
    //
    //     expect(decode_.isAuthorizationPayload).toBeFalsy();
    //
    // });

});
