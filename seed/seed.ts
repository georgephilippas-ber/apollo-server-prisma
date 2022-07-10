import {AgentManager, createManyAgentRandom} from "../src/database/managers/agent-manager";
import {faker} from "@faker-js/faker";


export async function seedDatabase(agentManager: AgentManager, cardinality: number = 0x0f)
{
    await agentManager.delete_all();

    await agentManager.insertAgent({
        forename: "Connor",
        surname: "Ledner",
        username: "connor_ledner",
        email: "connor.ledner@yahoo.com",
        password: "connor_ledner",
        passkey: "connorledner",
    });

    await createManyAgentRandom(agentManager, cardinality - 1);
}
