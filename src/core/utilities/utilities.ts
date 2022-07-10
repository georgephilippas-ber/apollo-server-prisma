import {inspect} from "node:util";

export function log(object_: unknown)
{
    console.log(inspect(object_, {depth: null, showHidden: false, colors: true}));
}

export function combine(object_array_: any)
{
    return object_array_.filter((value: any) => !([null, undefined].includes(value))).reduce((previousValue: any, currentValue: any) => Object.assign(currentValue, previousValue), {});
}

export function specifies(object_: any, properties_: string[]): boolean
{
    for (let property_ of properties_)
        if (!(Object.keys(object_).includes(property_) && (object_[property_] !== undefined)))
            return false;

    return true;
}

export function isolate(object_: any, properties_: string[]): any
{
    let isolated_: any = {};

    for (let property_ of properties_)
    {
        if (Object.keys(object_).includes(property_) && object_[property_] !== undefined && object_[property_] !== null)
        {
            isolated_[property_] = object_[property_];
        }
    }

    return isolated_;
}

export function toInteger(object_: any): number | undefined
{
    switch (typeof object_)
    {
        case "number":
            return Math.floor(object_);
        case "string":
            return isNaN(parseInt(object_)) ? undefined : parseInt(object_);

        case "undefined":
            return undefined;
        case "object":
            return undefined;

        default:
            return undefined;
    }
}

export function toProperCase(string_: string): string
{
    return string_.charAt(0).toUpperCase() + string_.slice(1).toLowerCase();
}

export function isString_email(string_: string) //RFC 5322
{
    return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(string_);
}
