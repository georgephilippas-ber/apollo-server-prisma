import {AgentManager, createManyAgentRandom} from "../src/database/managers/agent-manager";

export async function seedDatabase(agentManager: AgentManager, bypass_: boolean = false, cardinality: number = 0x04,)
{
    if (!bypass_)
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

        (await createManyAgentRandom(agentManager, cardinality - 1)).filter(value => value.error).forEach(value => console.log(value.error));

    }
}
