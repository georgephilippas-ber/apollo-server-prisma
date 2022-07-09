import {Server} from "./src/server/apollo-server";

import prismaClient from "./src/database/database-provider"
import {AgentManager, createAgentRandom, createManyAgentRandom} from "./src/database/managers/agent-manager";

Server.createAndStart();

let agentManager = new AgentManager(prismaClient);

createManyAgentRandom(agentManager, 4).then(value => console.log(value));
