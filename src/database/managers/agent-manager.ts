import {PrismaClient, Prisma, Agent} from "@prisma/client";
import {Encryption} from "../../core/authentication/encryption/encryption";

import {faker} from "@faker-js/faker";

export type candidate_agent_type_ =
    {
        forename: string;
        surname: string;
        username: string;
        email: string;
        password: string;
        passkey?: string;
    }

export class AgentManager
{
    prismaClient: PrismaClient;

    constructor(prismaClient: PrismaClient)
    {
        this.prismaClient = prismaClient;
    }

    async insertAgent(candidate_agent: candidate_agent_type_, active: boolean = true): Promise<Agent>
    {
        return this.prismaClient.agent.create({
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

    async deleteByUsername(username: string): Promise<Agent>
    {
        return this.prismaClient.agent.delete({
            where:
                {
                    username
                }
        });
    }

    async all(cardinality?: number): Promise<Agent[]>
    {
        return this.prismaClient.agent.findMany({take: cardinality});
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

    console.log(username, email, password, passkey);

    return {
        forename, surname, username, email, password, passkey
    }
}

export async function createAgentRandom(agentManager: AgentManager): Promise<Agent>
{
    return agentManager.insertAgent(candidateAgentRandom());
}

export async function createManyAgentRandom(agentManager: AgentManager, cardinality: number): Promise<Agent[]>
{
    return Promise.all(Array(cardinality).fill(0).map(value => createAgentRandom(agentManager)));
}
