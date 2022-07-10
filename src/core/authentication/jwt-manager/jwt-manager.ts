import * as jwt from 'jsonwebtoken';
import {isolate, specifies} from "../../utilities/utilities";
import crypto from "node:crypto";

export type authentication_payload_type_ =
    {
        agentId: number;
        sessionId: number;
        refresh: boolean;
    }

export class JwtManager
{
    secretOrPrivateKey: jwt.Secret;

    constructor(secretOrPrivateKey: jwt.Secret = crypto.randomUUID())
    {
        this.secretOrPrivateKey = secretOrPrivateKey;
    }

    public produce(authentication_payload_: authentication_payload_type_, expiration_minutes_?: number): string
    {
        let options_ = expiration_minutes_ ? {expiresIn: expiration_minutes_ + " minutes"} : undefined;

        return jwt.sign(authentication_payload_, this.secretOrPrivateKey, options_);
    }

    public obtain(jsonwebtoken_: string, verify: boolean = true): authentication_payload_type_ | null
    {
        try
        {
            let payload_: any = verify ? jwt.verify(jsonwebtoken_, this.secretOrPrivateKey) : jwt.decode(jsonwebtoken_);

            if (!specifies(payload_, ["agentId", "sessionId", "refresh"]))
                return null;
            else
                return isolate(payload_, ["agentId", "sessionId", "refresh"]) as authentication_payload_type_;
        } catch (e)
        {
            return null;
        }
    }

    isJwtToken(jsonwebtoken_: string, verify: boolean = false): boolean
    {
        try
        {
            let payload_: any = verify ? jwt.verify(jsonwebtoken_, this.secretOrPrivateKey) : jwt.decode(jsonwebtoken_);

            return true;
        } catch (e)
        {
            return false;
        }

    }
}
