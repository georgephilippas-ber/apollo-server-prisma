import {Agent, PrismaClient} from "@prisma/client";
import {Encryption} from "../../core/authentication/encryption/encryption";

import {faker} from "@faker-js/faker";
import {isString_email} from "../../core/utilities/utilities";
import {CRUD_operation_result_type_} from "../database-provider";

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

    constructor(prismaClient: PrismaClient)
    {
        this.prismaClient = prismaClient;
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

    let password = username;
    let passkey = forename.toLowerCase() + surname.toLowerCase();

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
