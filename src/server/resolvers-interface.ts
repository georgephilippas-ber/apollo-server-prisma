import {combine} from "../core/utilities/utilities";

type resolver_type_ = (parent: any, args: any, context: any, info: any) => any

export type resolvers_type_ =
    {
        [resolver_ in string]: resolver_type_
    }

export class Resolvers
{
    getQueryResolvers(): resolvers_type_
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
