import {PrismaClient, Profile} from "@prisma/client";
import {AgentManager} from "./agent-manager";
import {dbOperation_type_} from "../database-provider";

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

    async insertProfile(profile: candidate_profile_type_, agent_id: number): Promise<dbOperation_type_<Profile>>
    {
        try
        {
            return {
                error: "",
                payload:
                    await this.prismaClient.profile.create({
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
        } catch (e)
        {
            console.log((e as Error).message)

            return {error: (e as Error).message};
        }
    }

    async byAgentId(agent_id: number): Promise<Profile | null>
    {
        return this.prismaClient.profile.findFirst({
            where:
                {
                    agent:
                        {
                            id: agent_id
                        }
                }
        });
    }

    async byAgentUsername(username: string): Promise<Profile | null>
    {
        return this.prismaClient.profile.findFirst({
            where:
                {
                    agent:
                        {
                            username
                        }
                }
        })
    }

    async delete_all()
    {
        return this.prismaClient.profile.deleteMany();
    }
}
