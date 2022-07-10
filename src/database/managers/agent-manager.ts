import {Agent, PrismaClient} from "@prisma/client";
import {Encryption} from "../../core/authentication/encryption/encryption";

import {faker} from "@faker-js/faker";
import {isString_email} from "../../core/utilities/utilities";
import {CRUD_operation_result_type_} from "../database-provider";
import {JwtManager} from "../../core/authentication/jwt-manager/jwt-manager";

export type candidate_agent_type_ =
    {
        forename?: string;
        surname?: string;
        username: string;
        email: string;
        password: string;
        passkey?: string;
    }

export const candidateAgent_withoutPasskey: candidate_agent_type_ =
    {
        forename: "", surname: "", username: "", email: "", password: ""
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

    async insertAgent(candidate_agent: candidate_agent_type_, active: boolean = true): Promise<CRUD_operation_result_type_>
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
                payload:
                    await this.prismaClient.agent.create({
                            data:
                                {
                                    forename: candidate_agent.forename,
                                    surname: candidate_agent.surname,
                                    username: candidate_agent.username,
                                    email: candidate_agent.email,
                                    password_hash: Encryption.hash(candidate_agent.password),
                                    passkey_hash: candidate_agent.passkey ? Encryption.hash(candidate_agent.passkey) : undefined,
                                    active
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
        let passkey_hash = Encryption.hash(passkey);

        return this.prismaClient.agent.findUnique({where: {passkey_hash}})
    }

    async deleteBy(identifier: string): Promise<CRUD_operation_result_type_>
    {
        let where_: any = isString_email(identifier) ? {username: identifier} : {email: identifier};

        try
        {
            return {
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

    async authenticateUsingPasskey(credentials: string[])
    {
        if (credentials.length < 1 || credentials.includes(""))
            return null;

        return this.byPasskey(credentials[0]);
    }

    async authenticateUsingToken(credentials: string[])
    {
        if (credentials.length < 1 || credentials.includes(""))
            return null;

        this.jwtManager.obtain(credentials[0], true);
    }

    async authenticate(credentials: string[])
    {
        if (credentials.length > 1)
            return this.authenticateUsingPassword(credentials)
        else
            return this.authenticateUsingPasskey(credentials);
    }

    async delete_all()
    {
        return this.prismaClient.agent.deleteMany();
    }
}

function candidateAgentRandom(): candidate_agent_type_
{
    let forename = faker.name.firstName(), surname = faker.name.lastName();

    let username = faker.internet.userName(forename, surname).toLowerCase();
    let email = faker.internet.email(forename, surname).toLowerCase();

    let password = username, passkey = forename.toLowerCase() + surname.toLowerCase();

    console.log(forename, surname, username, email, password, passkey);

    return {
        forename, surname, username, email, password, passkey
    }
}

export async function createAgentRandom(agentManager: AgentManager): Promise<CRUD_operation_result_type_>
{
    return agentManager.insertAgent(candidateAgentRandom());
}

export async function createManyAgentRandom(agentManager: AgentManager, cardinality: number): Promise<CRUD_operation_result_type_[]>
{
    return Promise.all(Array(cardinality).fill(0).map(value => createAgentRandom(agentManager)));
}
