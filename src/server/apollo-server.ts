import express, {Express} from "express";
import http from "http";
import {ApolloServer} from "apollo-server-express";
import {buildSchema} from "graphql";
import {readFileSync} from "fs";
import {ApolloServerPluginDrainHttpServer} from "apollo-server-core";
import {ResolversCollection} from "./resolvers-interface";
import {Routers} from "./RESTful/router-interface";
import {urlJoin} from "url-join-ts";

export class Server
{
    express_application: Express;
    http_server: http.Server;

    apollo_server: ApolloServer;

    port: number;

    constructor(resolvers_collection_: ResolversCollection, routers_: Routers, port: number = 4_000)
    {
        this.express_application = express();

        this.http_server = http.createServer(this.express_application);

        this.port = port;

        this.apollo_server = new ApolloServer({
            typeDefs: buildSchema(readFileSync("./models/GraphQL/schema.graphql").toString("utf-8")),
            resolvers: resolvers_collection_.collectQueryResolvers(),
            csrfPrevention: true,
            cache: "bounded",
            plugins: [ApolloServerPluginDrainHttpServer({httpServer: this.http_server})]
        });

        routers_.getRouters().forEach(value =>
        {
            this.express_application.use("/" + value.getEndpoint(), value.getRouter);

            console.log(urlJoin("http://localhost:" + this.port, value.getEndpoint()));
        })
    }

    async start(): Promise<Server>
    {
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

    async stop()
    {
        console.log();
        console.log("!Apollo");

        await this.apollo_server.stop();
        this.http_server.close();
    }
}
