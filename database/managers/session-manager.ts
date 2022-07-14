import {PrismaClient, Session} from "@prisma/client";
import {AgentManager} from "./agent-manager";
import {dbOperation_type_} from "../database-provider";
import moment from "moment";

export class SessionManager
{
    prismaClient: PrismaClient;

    agentManager: AgentManager;

    constructor(prismaClient: PrismaClient, agentManager: AgentManager)
    {
        this.prismaClient = prismaClient;

        this.agentManager = agentManager;
    }

    all(): Promise<Session []>
    {
        return this.prismaClient.session.findMany();
    }

    async createSession(agent_id_: number, expiresIn: number): Promise<dbOperation_type_>
    {
        if (!(await this.agentManager.byId(agent_id_)))
            return {
                error: "!Agent"
            };

        try
        {
            return {
                error: "",
                payload: await this.prismaClient.session.create({
                    data:
                        {
                            expiresAt: moment().add(expiresIn, "minutes").toDate(),
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

    async deleteSessionById(id: number): Promise<dbOperation_type_>
    {
        if (id >= 0)
        {
            try
            {
                return {
                    error: "",
                    payload: await this.prismaClient.session.delete({
                        where: {id}
                    })
                }
            } catch (e)
            {
                return {error: (e as Error).message};
            }
        } else
            return {error: "-1"}
    }

    valid(session: Session, agent_id?: number)
    {
        return moment(session.expiresAt) > moment() && (agent_id ? session.agentId == agent_id : true);
    }

    async isSessionValid(id: number, agent_id?: number): Promise<boolean> //found && !expired && if agent_id_ does it correspond to agent
    {
        let session_ = await this.prismaClient.session.findUnique({where: {id}});

        if (!session_)
            return false;
        else
            return this.valid(session_, agent_id);
    }

    async deleteExpiredSessions(agent_id: number): Promise<number>
    {
        return (await this.prismaClient.session.deleteMany({
            where:
                {
                    agentId: agent_id,
                    expiresAt: {
                        lte: moment().toDate()
                    }
                }
        })).count;
    }
}
