import * as bcrypt from 'bcrypt'

export class Encryption
{
    public static hash(string_: string): string
    {
        return bcrypt.hashSync(string_, 0x0f);
    }

    public static verify(string_: string, string_hash_: string): boolean
    {
        return bcrypt.compareSync(string_, string_hash_);
    }
}
