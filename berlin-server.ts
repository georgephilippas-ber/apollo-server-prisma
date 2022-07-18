import {JwtManager} from "./core/authorization/jwt-manager/jwt-manager";
import {AgentManager} from "./database/managers/agent-manager";
import {prismaClient} from "./database/database-provider";
import {SessionManager} from "./database/managers/session-manager";
import {ResolversCollection} from "./server/GraphQL-resolvers/resolvers-interface";
import {AgentResolvers} from "./server/GraphQL-resolvers/agent-resolvers/agent-resolvers";
import {seedDatabase} from "./seed/seed";
import {Server} from "./server/apollo-server";
import {Routers} from "./server/REST-routers/router-interface";
import {AuthorizationRouter} from "./server/REST-routers/routers/authorization/authorization-router";
import {ProfileResolvers} from "./server/GraphQL-resolvers/profile-resolvers/profile-resolvers";
import {ProfileManager} from "./database/managers/profile-manager";

export class BerlinServer
{
    jwtManager: JwtManager;

    //
    agentManager: AgentManager;
    sessionManager: SessionManager;
    profileManager: ProfileManager;

    //
    agentResolvers: AgentResolvers;
    profileResolvers: ProfileResolvers;

    resolversCollection: ResolversCollection;

    //
    authorizationRouter: AuthorizationRouter;
    routers: Routers;

    server: Server

    constructor(port: number = 4_000)
    {
        this.jwtManager = new JwtManager();

        this.agentManager = new AgentManager(prismaClient, this.jwtManager);
        this.sessionManager = new SessionManager(prismaClient, this.agentManager);
        this.profileManager = new ProfileManager(prismaClient, this.agentManager);

        this.agentResolvers = new AgentResolvers(this.agentManager);
        this.profileResolvers = new ProfileResolvers(this.profileManager);
        this.resolversCollection = new ResolversCollection([this.agentResolvers, this.profileResolvers,]);

        this.authorizationRouter = new AuthorizationRouter(this.agentManager, this.sessionManager, this.jwtManager);
        this.routers = new Routers([this.authorizationRouter]);

        this.server = new Server(this.resolversCollection, this.routers, port);
    }

    async start(onSIGINT: boolean = true)
    {
        await seedDatabase(this.agentManager, this.profileManager, 0x04);

        if (onSIGINT)
            process.on("SIGINT", async args =>
            {
                await this.server.stop();
            });
    }

    async stop()
    {
        await this.server.stop();
    }
}
