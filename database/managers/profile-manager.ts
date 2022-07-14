import {PrismaClient, Profile} from "@prisma/client";
import {AgentManager} from "./agent-manager";

export type candidate_profile_type_ =
    {
        forename: string;
        surname: string;
        birthdate: string;
        location?: string;
        avatar_url?: string;
    }

export class ProfileManager
{
    prismaClient: PrismaClient;

    agentManager: AgentManager;

    constructor(prismaClient: PrismaClient, agentManager: AgentManager)
    {
        this.prismaClient = prismaClient;

        this.agentManager = agentManager;
    }

    create(profile: candidate_profile_type_, agent_id: number)
    {
        this.prismaClient.profile.create({
            data:
                {
                    forename: profile.forename,
                    surname: profile.surname,
                    birthdate: profile.birthdate,
                    location: profile.location,
                    avatar: profile.avatar_url ?
                        {
                            create:
                                {
                                    url: profile.avatar_url
                                }
                        } : undefined,
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
