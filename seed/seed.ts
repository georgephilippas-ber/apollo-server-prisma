import {AgentManager, candidate_agent_type_} from "../src/database/managers/agent-manager";
import {faker} from "@faker-js/faker";
import {CRUD_operation_result_type_} from "../src/database/database-provider";

function candidateAgentRandom(): candidate_agent_type_
{
    let forename = faker.name.firstName(), surname = faker.name.lastName();

    let username = faker.internet.userName(forename, surname).toLowerCase();
    let email = faker.internet.email(forename, surname).toLowerCase();

    let password = username, passkey = forename.toLowerCase() + surname.toLowerCase();

    console.log(forename, surname, username, email, password, passkey);

    return {
        username, email, password, passkey
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

export async function seedDatabase(agentManager: AgentManager, cardinality: number = 0x04, bypass_: boolean = false)
{
    if (!bypass_)
    {
        await agentManager.delete_all();

        (await createManyAgentRandom(agentManager, cardinality)).filter(value => value.error).forEach(value => console.log(value.error));
    }
}
