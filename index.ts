import {prismaClient} from "./src/database/database-provider"

import {ResolversCollection} from "./src/server/GraphQL-resolvers/resolvers-interface";
import {AgentResolvers} from "./src/server/GraphQL-resolvers/agent-resolvers/agent-resolvers";

import {Routers} from "./src/server/RESTful-routes/router-interface";
import {AuthorizationRouter} from "./src/server/RESTful-routes/routers/authorization/authorization-router";

import {AgentManager} from "./src/database/managers/agent-manager";
import {SessionManager} from "./src/database/managers/session-manager";
import {JwtManager} from "./src/core/authorization/jwt-manager/jwt-manager";

import {seedDatabase} from "./seed/seed";

import {Server} from "./src/server/apollo-server";

export function berlinServer()
{
    let jwtManager = new JwtManager();

    let agentManager = new AgentManager(prismaClient, jwtManager);
    let sessionManager = new SessionManager(prismaClient, agentManager);

    let resolversCollection = new ResolversCollection([new AgentResolvers(agentManager)]);

    seedDatabase(agentManager, true).then(async value =>
    {
        let server_ = new Server(resolversCollection, new Routers([new AuthorizationRouter(agentManager, sessionManager, jwtManager)]));

        await server_.start();

        process.on("SIGINT", async args =>
        {
            await server_.stop();
        });
    });
}

// berlinServer();

module.exports = { berlinServer };
