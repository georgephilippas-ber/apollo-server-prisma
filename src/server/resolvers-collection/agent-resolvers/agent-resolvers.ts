import {Resolvers} from "../../resolvers-interface";
import {AgentManager} from "../../../database/managers/agent-manager";

import {resolvers_type_} from "../../resolvers-interface";

export class AgentResolvers extends Resolvers
{
    agentManager: AgentManager;

    constructor(agentManager: AgentManager)
    {
        super();

        this.agentManager = agentManager;
    }

    getQueryResolvers(): resolvers_type_
    {
        return {
            all: (parent, args) => this.agentManager.all(args.cardinality)
        }
    }
}
