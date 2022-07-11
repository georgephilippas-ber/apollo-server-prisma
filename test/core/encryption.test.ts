import {Encryption} from "../../src/core/authorization/encryption/encryption";

let encrypted_ = "random";

let correct_guess_ = "random";
let incorrect_guess_ = "rnd"

describe("Encryption", () =>
{
    let hash_ = Encryption.hash(encrypted_);

    it("verify (correct_guess_)", () =>
    {
        expect(Encryption.verify(correct_guess_, hash_)).toBeTruthy();
    });

    it("verify (incorrect_guess_)", () =>
    {
        expect(Encryption.verify(incorrect_guess_, hash_)).toBeFalsy();
    })
});
