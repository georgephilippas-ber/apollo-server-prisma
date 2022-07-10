import {AgentManager, createManyAgentRandom} from "../src/database/managers/agent-manager";

export async function seedDatabase(agentManager: AgentManager, cardinality: number = 0x04)
{
    await agentManager.delete_all();

    await agentManager.insertAgent({
        forename: "Connor",
        surname: "Ledner",
        username: "",
        email: "connor.ledner@yahoo.com",
        password: "connor_ledner",
        passkey: "connorledner",
    }).then(value => console.log(value.error));

    (await createManyAgentRandom(agentManager, cardinality - 1)).filter(value => value.error).forEach(value => console.log(value.error));
}
