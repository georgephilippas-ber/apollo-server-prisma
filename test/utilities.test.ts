import {combine, toInteger} from "../core/utilities/utilities";

describe("utilities", () =>
{
    it("combine", () =>
    {
        let obj1 = {
            a: 10,
            b: undefined,
            d: "string"
        }
        let obj2 = {
            d: 20,
            f: 10
        }

        expect(combine([obj1, obj2])).toHaveProperty(["a"]);

        expect(combine([obj1, obj2])).toHaveProperty(["b"]);
        expect(combine([obj1, obj2]).b).toBeUndefined();

        expect(combine([obj1, obj2])).toHaveProperty(["d"]);
        expect(combine([obj1, obj2])).toHaveProperty(["f"]);


        expect(combine([obj1, obj2]).g).toBeUndefined();
    });

    it("toInteger", () =>
    {
        expect(toInteger([20])).toBeUndefined();
        expect(toInteger("20")).toEqual(20);
        expect(toInteger("20b")).toEqual(20);
        expect(toInteger("20b6")).toEqual(20);
    })
});
