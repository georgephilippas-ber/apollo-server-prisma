import {Server} from "./src/server/apollo-server";

import {prismaClient} from "./src/database/database-provider"
import {AgentManager} from "./src/database/managers/agent-manager";
import {seedDatabase} from "./seed/seed";
import {ResolversCollection} from "./src/server/resolvers-interface";
import {AgentResolvers} from "./src/server/resolvers-collection/agent-resolvers/agent-resolvers";

let agentManager = new AgentManager(prismaClient);

let resolversCollection = new ResolversCollection([new AgentResolvers(agentManager)]);

seedDatabase(agentManager).then(async value =>
{
    let server_ = new Server(resolversCollection)

    await server_.start();

    process.on("SIGINT", async args =>
    {
        await server_.stop();
    });
});
