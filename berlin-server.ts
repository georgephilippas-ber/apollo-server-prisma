import {JwtManager} from "./core/authorization/jwt-manager/jwt-manager";
import {AgentManager} from "./database/managers/agent-manager";
import {prismaClient} from "./database/database-provider";
import {SessionManager} from "./database/managers/session-manager";
import {ResolversCollection} from "./server/GraphQL-resolvers/resolvers-interface";
import {AgentResolvers} from "./server/GraphQL-resolvers/agent-resolvers/agent-resolvers";
import {seedDatabase} from "./seed/seed";
import {Server} from "./server/apollo-server";
import {Routers} from "./server/RESTful-routes/router-interface";
import {AuthorizationRouter} from "./server/RESTful-routes/routers/authorization/authorization-router";

export async function berlinServer(port: number = 4_000, cardinality: number = 0x02): Promise<Server> {
    let jwtManager = new JwtManager();

    let agentManager = new AgentManager(prismaClient, jwtManager);
    let sessionManager = new SessionManager(prismaClient, agentManager);

    let resolversCollection = new ResolversCollection([new AgentResolvers(agentManager)]);

    await seedDatabase(agentManager, cardinality);

    let server_ = new Server(resolversCollection, new Routers([new AuthorizationRouter(agentManager, sessionManager, jwtManager)]), port);

    process.on("SIGINT", async args => {
        await server_.stop();
    });

    return server_.start();
}
