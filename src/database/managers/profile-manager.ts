import {PrismaClient, Profile} from "@prisma/client";
import {AgentManager} from "./agent-manager";

export class ProfileManager
{
    prismaClient: PrismaClient;

    agentManager: AgentManager;

    constructor(prismaClient: PrismaClient, agentManager: AgentManager)
    {
        this.prismaClient = prismaClient;

        this.agentManager = agentManager;
    }

    create(profile: Profile, agent_id: number)
    {
        this.prismaClient.profile.create({
            data:
                {
                    forename: profile.forename,
                    surname: profile.surname,
                    birthdate: profile.birthdate,
                    avatar:
                        {
                            create:
                                {
                                    url: ""
                                }
                        },
                    agent:
                        {
                            connect:
                                {
                                    id: agent_id
                                }
                        }
                }
        })
    }
}
