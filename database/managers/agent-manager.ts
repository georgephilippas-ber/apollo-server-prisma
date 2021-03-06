import {Agent, PrismaClient} from "@prisma/client";
import {Encryption} from "../../core/authorization/encryption/encryption";
import {isString_email} from "../../core/utilities/utilities";
import {dbOperation_type_} from "../database-provider";
import {JwtManager} from "../../core/authorization/jwt-manager/jwt-manager";

export type candidate_agent_type_ =
    {
        username: string;
        email: string;
        password: string;
        passkey?: string;
    }

export const candidateAgent_withoutPasskey: candidate_agent_type_ =
    {
        username: "", email: "", password: ""
    };
export const candidateAgent_withPasskey: candidate_agent_type_ =
    {
        ...candidateAgent_withoutPasskey, passkey: ""
    };

export class AgentManager
{
    prismaClient: PrismaClient;

    jwtManager: JwtManager;

    constructor(prismaClient: PrismaClient, jwtManager: JwtManager)
    {
        this.prismaClient = prismaClient;

        this.jwtManager = jwtManager;
    }

    async all(cardinality?: number): Promise<Agent[]>
    {
        return this.prismaClient.agent.findMany({take: cardinality});
    }

    async insertAgent(candidate_agent: candidate_agent_type_, active: boolean = true): Promise<dbOperation_type_<Agent>>
    {
        let error_: string[] = [];

        if (!candidate_agent.username)
            error_.push("!username")
        if (!candidate_agent.email)
            error_.push("!email");
        if (!candidate_agent.password)
            error_.push("!password");

        if (error_.length > 0)
            return {error: error_.join(", ")};

        try
        {
            return {
                error: "",
                payload:
                    await this.prismaClient.agent.create({
                            data:
                                {
                                    username: candidate_agent.username,
                                    email: candidate_agent.email,
                                    password_hash: Encryption.hash(candidate_agent.password),
                                    passkey_hash: candidate_agent.passkey,
                                    active,
                                }
                        }
                    )
            }
        } catch (e)
        {
            console.log((e as Error).message)

            return {error: (e as Error).message};
        }
    }

    async byId(id: number): Promise<Agent | null>
    {
        return this.prismaClient.agent.findUnique({where: {id}});
    }

    async byUsername(username: string): Promise<Agent | null>
    {
        return this.prismaClient.agent.findUnique({where: {username}});
    }

    async byEmail(email: string): Promise<Agent | null>
    {
        return this.prismaClient.agent.findUnique({where: {email}});
    }

    async byPasskey(passkey: string): Promise<Agent | null>
    {
        return this.prismaClient.agent.findUnique({where: {passkey_hash: passkey}})
    }

    async deleteBy(identifier: string): Promise<dbOperation_type_<Agent>>
    {
        let where_: any = isString_email(identifier) ? {username: identifier} : {email: identifier};

        try
        {
            return {
                error: "",
                payload: await this.prismaClient.agent.delete({
                    where: where_
                })
            }
        } catch (e)
        {
            console.log((e as Error).message)

            return {error: (e as Error).message};
        }
    }

    async authenticateUsingPassword(credentials: string[]): Promise<Agent | null>
    {
        let agent_: Agent | null;

        if (credentials.length < 2 || credentials.includes(""))
            return null;

        if (isString_email(credentials[0]))
            agent_ = await this.byEmail(credentials[0]);
        else
            agent_ = await this.byUsername(credentials[0]);

        if (!agent_)
            return null;

        if (!Encryption.verify(credentials[1], agent_.password_hash))
            return null;
        else
            return agent_;
    }

    async authenticateUsingPasskey(credentials: string[]): Promise<Agent | null>
    {
        if (credentials.length < 1 || credentials.includes(""))
            return null;

        return this.byPasskey(credentials[0]);
    }

    async authenticateUsingToken(credentials: string[]): Promise<Agent | null>
    {
        if (credentials.length < 1 || credentials.includes(""))
            return null;

        let jwtDecode = this.jwtManager.decode(credentials[0]);

        if (jwtDecode.valid && jwtDecode.payload)
            return this.byId(jwtDecode.payload.agentId);
        else
            return null;
    }

    async authenticate(credentials: string[]): Promise<Agent | null>
    {
        let agent_: Agent | null;

        if (credentials.length > 1)
            agent_ = await this.authenticateUsingPassword(credentials)
        else if (this.jwtManager.decode(credentials[0]).isAuthorizationPayload)
        {
            agent_ = await this.authenticateUsingToken(credentials);
        } else
        {
            agent_ = await this.authenticateUsingPasskey(credentials);
        }


        return agent_?.active ? agent_ : null;
    }

    async delete_all()
    {
        return this.prismaClient.agent.deleteMany();
    }
}
