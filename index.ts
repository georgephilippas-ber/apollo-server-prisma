import {Server} from "./src/server/apollo-server";

import {prismaClient} from "./src/database/database-provider"
import {AgentManager} from "./src/database/managers/agent-manager";
import {seedDatabase} from "./seed/seed";
import {ResolversCollection} from "./src/server/GraphQL-resolvers/resolvers-interface";
import {AgentResolvers} from "./src/server/GraphQL-resolvers/agent-resolvers/agent-resolvers";
import {
    AuthenticationRouter,
    authenticationMiddleware
} from "./src/server/RESTful-routes/routers/authentication/authentication-router";
import {Routers} from "./src/server/RESTful-routes/router-interface";
import {JwtManager} from "./src/core/authentication/jwt-manager/jwt-manager";
import {SessionManager} from "./src/database/managers/session-manager";


function server()
{

    let jwtManager = new JwtManager();

    let agentManager = new AgentManager(prismaClient, jwtManager);
    let sessionManager = new SessionManager(prismaClient, agentManager);

    console.log(jwtManager.getSecretOrPrivateKey());

    let resolversCollection = new ResolversCollection([new AgentResolvers(agentManager)]);

    seedDatabase(agentManager, true).then(async value =>
    {
        let server_ = new Server(resolversCollection, new Routers([new AuthenticationRouter(agentManager, sessionManager, jwtManager)]));

        await server_.start();

        process.on("SIGINT", async args =>
        {
            await server_.stop();
        });
    });
}

server();
