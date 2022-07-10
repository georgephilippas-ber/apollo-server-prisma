import {PrismaClient} from "@prisma/client";
import {AgentManager} from "./agent-manager";
import {CRUD_operation_result_type_} from "../database-provider";

export class SessionManager
{
    prismaClient: PrismaClient;

    agentManager: AgentManager;

    constructor(prismaClient: PrismaClient, agentManager: AgentManager)
    {
        this.prismaClient = prismaClient;

        this.agentManager = agentManager;
    }

    async createSession(agent_id_: number, expiresIn?: number): Promise<CRUD_operation_result_type_>
    {
        if (!(await this.agentManager.byId(agent_id_)))
            return {
                error: "!Agent"
            };

        try
        {
            return {
                payload: await this.prismaClient.session.create({
                    data:
                        {
                            expiresIn: expiresIn,
                            Agent:
                                {
                                    connect:
                                        {
                                            id: agent_id_
                                        }
                                }
                        }
                })
            }
        } catch (e)
        {
            return {
                error: (e as Error).message
            }
        }
    }

    async deleteSession(id: number)
    {
        try
        {
            return {
                payload: await this.prismaClient.session.delete({
                    where: {id}
                })
            }
        } catch (e)
        {
            console.log((e as Error).message)

            return {error: (e as Error).message};
        }
    }
}
