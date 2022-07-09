import {combine, toInteger} from "../core/utilities/utilities";

describe("utilities", () =>
{
    it("combine", () =>
    {
        let obj1 = {
            a: 1,
            b: "string",
            c: undefined,
            d: null
        }
        let obj2 = {
            d: undefined,
            e: null,
            f: -1
        }

        expect(combine([obj1, obj2])).toHaveProperty(["a"]);

        expect(combine([obj1, obj2])).toHaveProperty(["b"]);
        expect(combine([obj1, obj2])).toHaveProperty(["c"]);
        expect(combine([obj1, obj2]).c).toBeUndefined();
        expect(combine([obj1, obj2])).toHaveProperty(["d"]);
        expect(combine([obj1, obj2])).toHaveProperty(["e"]);
        expect(combine([obj1, obj2])).toHaveProperty(["f"]);

        expect(combine([obj1, obj2]).g).toBeUndefined();
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
