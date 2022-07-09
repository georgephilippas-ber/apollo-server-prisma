import * as bcrypt from 'bcrypt'

import * as crypto from "crypto";

export class Encryption
{
    public static hash_passkey(passkey_: string): string
    {
        let hash_: crypto.Hash = crypto.createHash("sha512").update(passkey_);

        return hash_.digest().toString("hex");
    }

    public static hash_password(password_: string): string
    {
        return bcrypt.hashSync(password_, 0x0f);
    }

    public static verify_password(password_: string, password_hash_: string): boolean
    {
        return bcrypt.compareSync(password_, password_hash_);
    }
}
