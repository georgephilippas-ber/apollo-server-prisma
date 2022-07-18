import {combine} from "../../core/utilities/utilities";

type queryResolver_type = (parent: any, args: any, context: any, info: any) => any

export type queryResolvers_type =
    {
        [resolver_ in string]: queryResolver_type
    }

export class Resolvers
{
    getQueryResolvers(): queryResolvers_type
    {
        return {}
    }
}

export class ResolversCollection
{
    resolvers_: Resolvers[];

    constructor(resolvers_: Resolvers[])
    {
        this.resolvers_ = resolvers_;
    }

    collectQueryResolvers(): any
    {
        return {
            Query: combine(this.resolvers_.map(value => value.getQueryResolvers()))
        };
    }
}
