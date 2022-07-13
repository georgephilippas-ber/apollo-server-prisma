import {AgentManager, createManyAgentRandom} from "../src/database/managers/agent-manager";

export async function seedDatabase(agentManager: AgentManager, bypass_: boolean = false, cardinality: number = 0x04,) {
    if (!bypass_) {
        await agentManager.delete_all();

        (await createManyAgentRandom(agentManager, cardinality)).filter(value => value.error).forEach(value => console.log(value.error));
    }
}
