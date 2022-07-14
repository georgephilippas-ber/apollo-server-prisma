import {AgentManager} from "../../../database/managers/agent-manager";
import {prismaClient} from "../../../database/database-provider";

import {JwtManager} from "../../../core/authorization/jwt-manager/jwt-manager";
import {createAgentRandom} from "../../../seed/seed";

let agentManager = new AgentManager(prismaClient, new JwtManager());

beforeAll(async () =>
{
    await agentManager.delete_all();

    await createAgentRandom(agentManager);
}, 60_000);

describe("agent-manager", () =>
{
    it("count", async () =>
    {
        expect((await agentManager.all()).length).toBe(4);
    })
});
