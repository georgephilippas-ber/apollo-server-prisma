import {AgentManager, createManyAgentRandom} from "../../../src/database/managers/agent-manager";
import {prismaClient} from "../../../src/database/database-provider";

let agentManager = new AgentManager(prismaClient);

beforeAll(async () =>
{
    await agentManager.delete_all();

    await createManyAgentRandom(agentManager, 0x04);
}, 60_000);

describe("agent-manager", () =>
{
    it("count", async () =>
    {
        expect((await agentManager.all()).length).toBe(4);
    })
});
