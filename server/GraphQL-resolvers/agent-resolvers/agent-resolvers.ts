import {Resolvers} from "../resolvers-interface";
import {AgentManager} from "../../../database/managers/agent-manager";

import {queryResolvers_type} from "../resolvers-interface";

export class AgentResolvers extends Resolvers
{
    agentManager: AgentManager;

    constructor(agentManager: AgentManager)
    {
        super();

        this.agentManager = agentManager;
    }

    getQueryResolvers(): queryResolvers_type
    {
        return {
            all: (parent, args) => this.agentManager.all(args.cardinality)
        }
    }
}
