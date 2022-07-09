import * as jwt from 'jsonwebtoken';
import {isolate, specifies} from "../../utilities/utilities";
import crypto from "node:crypto";

export type authentication_payload_type_ =
    {
        agentId: number | string;
        refresh: boolean;
    }

export class Manager_jwt
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

    public obtain(jsonwebtoken_: string): authentication_payload_type_ | null
    {
        try
        {
            let payload_: any = jwt.verify(jsonwebtoken_, this.secretOrPrivateKey);

            if (!specifies(payload_, ["agentId", "refresh"]))
                return null;
            else
                return isolate(payload_, ["agentId", "refresh"]) as authentication_payload_type_;
        } catch (e)
        {
            return null;
        }
    }
}
