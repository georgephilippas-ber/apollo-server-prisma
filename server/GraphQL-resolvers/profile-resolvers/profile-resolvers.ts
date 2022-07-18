import {queryResolvers_type, Resolvers} from "../resolvers-interface";
import {ProfileManager} from "../../../database/managers/profile-manager";

export class ProfileResolvers extends Resolvers
{
    profileManager: ProfileManager;

    constructor(profileManager: ProfileManager)
    {
        super();

        this.profileManager = profileManager;
    }

    getQueryResolvers(): queryResolvers_type
    {
        return {
            byAgentId: (parent, args) => this.profileManager.byAgentId(args.agentId),
            byUsername: (parent, args) => this.profileManager.byAgentUsername(args.username)
        }
    }
}
