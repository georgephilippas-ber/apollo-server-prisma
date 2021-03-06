import express, {Express} from "express";
import http from "http";
import {ApolloServer} from "apollo-server-express";
import {buildSchema} from "graphql";
import {readFileSync} from "fs";
import {ApolloServerPluginDrainHttpServer} from "apollo-server-core";
import {ResolversCollection} from "./GraphQL-resolvers/resolvers-interface";
import {RouterClass, Routers} from "./REST-routers/router-interface";
import {urlJoin} from "url-join-ts";

import cors from "cors"

export class Server
{
    express_application: Express;
    http_server: http.Server;

    apollo_server: ApolloServer;

    port: number;

    routers_: Routers;

    constructor(resolvers_collection_: ResolversCollection, routers_: Routers, port: number = 4_000)
    {
        this.express_application = express();

        this.express_application.use(cors());
        this.express_application.use(express.static("depot"));

        this.http_server = http.createServer(this.express_application);

        this.port = port;

        this.apollo_server = new ApolloServer({
            typeDefs: buildSchema(readFileSync(__dirname + "/GraphQL/schema.graphql").toString("utf-8")),
            resolvers: resolvers_collection_.collectQueryResolvers(),
            csrfPrevention: true,
            cache: "bounded",
            plugins: [ApolloServerPluginDrainHttpServer({httpServer: this.http_server})]
        });

        this.routers_ = routers_;
    }

    public addRouter(router_: RouterClass)
    {
        this.routers_.add(router_);
    }

    async start(): Promise<Server>
    {
        this.routers_.getRouters().forEach(value =>
        {
            this.express_application.use("/" + value.getEndpoint(), value.getRouter());

            console.log(urlJoin("http://localhost:" + this.port, value.getEndpoint()));
        });

        await this.apollo_server.start();

        this.apollo_server.applyMiddleware({
            app: this.express_application
        });

        this.http_server.listen({port: this.port}, () =>
        {
            console.log("http://localhost:" + this.port + this.apollo_server.graphqlPath)
        });

        return this;
    }

    getExpress(): Express
    {
        return this.express_application;
    }

    async stop()
    {
        console.log();
        console.log("!Apollo");

        await this.apollo_server.stop();
        this.http_server.close();
    }
}
