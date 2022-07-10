import {Server} from "./src/server/apollo-server";

import {prismaClient} from "./src/database/database-provider"
import {AgentManager, createAgentRandom, createManyAgentRandom} from "./src/database/managers/agent-manager";

Server.createAndStart();

let agentManager = new AgentManager(prismaClient);

async function main()
{
    await agentManager.delete_all();

    await agentManager.insertAgent({
        forename: "george",
        surname: "george",
        email: "george",
        passkey: "george",
        username: "george",
        password: "george"
    });
    await createManyAgentRandom(agentManager, 4);
    console.log(await agentManager.all());
    await agentManager.deleteByUsername("george");
    console.log(await agentManager.all());
}

main();
