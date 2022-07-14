import {AgentManager, candidate_agent_type_} from "../src/database/managers/agent-manager";
import {faker} from "@faker-js/faker";
import {dbOperation_type_} from "../src/database/database-provider";




export async function createAgentRandom(agentManager: AgentManager): Promise<dbOperation_type_>
{
    function candidateAgentRandom(forename: string = faker.name.firstName(), surname: string = faker.name.lastName()): candidate_agent_type_
    {
        let username = faker.internet.userName(forename, surname).toLowerCase();
        let email = faker.internet.email(forename, surname).toLowerCase();

        let password = username, passkey = forename.toLowerCase() + surname.toLowerCase();

        console.log(forename, surname, username, email, password, passkey);

        return {
            username, email, password, passkey
        }
    }

    return agentManager.insertAgent(candidateAgentRandom());
}

export async function createManyAgentRandom(agentManager: AgentManager, cardinality: number): Promise<dbOperation_type_[]>
{
    return Promise.all(Array(cardinality).fill(0).map(value => createAgentRandom(agentManager)));
}

export async function seedDatabase(agentManager: AgentManager, cardinality: number = 0x04, bypass_: boolean = false)
{
    if (!bypass_)
    {
        await agentManager.delete_all();

        (await createManyAgentRandom(agentManager, cardinality)).filter(value => value.error).forEach(value => console.log(value.error));
    }
}
