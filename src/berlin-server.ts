import {JwtManager} from "./core/authorization/jwt-manager/jwt-manager";
import {AgentManager} from "./database/managers/agent-manager";
import {prismaClient} from "./database/database-provider";
import {SessionManager} from "./database/managers/session-manager";
import {ResolversCollection} from "./server/GraphQL-resolvers/resolvers-interface";
import {AgentResolvers} from "./server/GraphQL-resolvers/agent-resolvers/agent-resolvers";
import {seedDatabase} from "../seed/seed";
import {Server} from "./server/apollo-server";
import {Routers} from "./server/RESTful-routes/router-interface";
import {AuthorizationRouter} from "./server/RESTful-routes/routers/authorization/authorization-router";

export function berlinServer()
{
    let jwtManager = new JwtManager();

    let agentManager = new AgentManager(prismaClient, jwtManager);
    let sessionManager = new SessionManager(prismaClient, agentManager);

    let resolversCollection = new ResolversCollection([new AgentResolvers(agentManager)]);

    seedDatabase(agentManager, 0x0f).then(async value =>
    {
        let server_ = new Server(resolversCollection, new Routers([new AuthorizationRouter(agentManager, sessionManager, jwtManager)]));

        await server_.start();

        process.on("SIGINT", async args =>
        {
            await server_.stop();
        });
    });
}
