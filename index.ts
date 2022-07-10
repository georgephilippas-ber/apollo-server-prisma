import {Server} from "./src/server/apollo-server";

import {prismaClient} from "./src/database/database-provider"
import {AgentManager, createManyAgentRandom} from "./src/database/managers/agent-manager";
import {seedDatabase} from "./seed/seed";

let agentManager = new AgentManager(prismaClient);

seedDatabase(agentManager).then(value => Server.createAndStart());
