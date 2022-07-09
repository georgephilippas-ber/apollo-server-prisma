import {combine, toInteger} from "../src/core/utilities/utilities";

describe("utilities", () =>
{
    it("combine", () =>
    {
        let first = {
            a: 1,
            b: "string",
            c: undefined,
            d: null
        };

        let second = {
            d: undefined,
            e: null,
            f: -1
        };

        expect(combine([first, second])).toHaveProperty(["a"]);

        expect(combine([first, second])).toHaveProperty(["b"]);
        expect(combine([first, second])).toHaveProperty(["c"]);
        expect(combine([first, second]).c).toBeUndefined();
        expect(combine([first, second])).toHaveProperty(["d"]);
        expect(combine([first, second])).toHaveProperty(["e"]);
        expect(combine([first, second])).toHaveProperty(["f"]);

        expect(combine([first, second]).g).toBeUndefined();
    });

    it("toInteger", () =>
    {
        expect(toInteger([0xff])).toBeUndefined();
        expect(toInteger("100")).toEqual(100);
        expect(toInteger("100b")).toEqual(100);
        expect(toInteger("100b200")).toEqual(100);
        expect(toInteger("b100")).toBeUndefined();
    })
});
