import * as jwt from 'jsonwebtoken';
import {JwtPayload} from 'jsonwebtoken';
import crypto from "node:crypto";
import {isolate, specifies} from "../../utilities/utilities";

export interface jwtAuthorizationPayload_type extends JwtPayload
{
    agentId: number;
    sessionId: number;
    canRefresh: boolean;
}

const _introspection_jwtAuthorizationPayload: jwtAuthorizationPayload_type = {
    agentId: -1, sessionId: -1, canRefresh: true
}

type jwtDecode_type = {
    payload?: jwtAuthorizationPayload_type;

    isAuthorizationPayload: boolean;
    hasValidSignature: boolean;

    valid: boolean;
}

export class JwtManager
{
    secretOrPrivateKey: jwt.Secret;

    constructor(secretOrPrivateKey: jwt.Secret = crypto.randomUUID())
    {
        this.secretOrPrivateKey = secretOrPrivateKey;
    }

    public produce(authorizationPayload: jwtAuthorizationPayload_type, expiration_minutes_?: number): string
    {
        return jwt.sign(authorizationPayload, this.secretOrPrivateKey, expiration_minutes_ !== undefined ? {expiresIn: [expiration_minutes_, "minutes"].join(" ")} : undefined);
    }

    public decode(jsonwebtoken_: string): jwtDecode_type
    {
        let jwtDecode: jwtDecode_type = {
            isAuthorizationPayload: false, hasValidSignature: false, valid: false
        }

        let payload_ = jwt.decode(jsonwebtoken_);

        if (payload_)
        {
            if (specifies(payload_, Object.keys(_introspection_jwtAuthorizationPayload)))
            {
                jwtDecode.payload = isolate(payload_, Object.keys(_introspection_jwtAuthorizationPayload));

                jwtDecode.isAuthorizationPayload = true;
            } else
                jwtDecode.isAuthorizationPayload = false;

            try
            {
                jwt.verify(jsonwebtoken_, this.secretOrPrivateKey);

                jwtDecode.hasValidSignature = true;
            } catch (e)
            {

            }
        }

        jwtDecode.valid = jwtDecode.isAuthorizationPayload && jwtDecode.hasValidSignature;

        return jwtDecode;
    }

    public getSecretOrPrivateKey()
    {
        return this.secretOrPrivateKey;
    }
}
