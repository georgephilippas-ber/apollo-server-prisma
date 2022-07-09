import express, {Express} from "express";
import http from "http";
import {ApolloServer} from "apollo-server-express";
import {buildSchema} from "graphql";
import {readFileSync} from "fs";
import {ApolloServerPluginDrainHttpServer} from "apollo-server-core";

export class Server
{
    express_application: Express;
    http_server: http.Server;

    apollo_server: ApolloServer;

    port: number;

    constructor(resolvers: { Query: any }, port: number = 4_000)
    {
        this.express_application = express();

        this.http_server = http.createServer(this.express_application);

        this.port = port;

        this.apollo_server = new ApolloServer({
            typeDefs: buildSchema(readFileSync("./GraphQL/schema.graphql").toString("utf-8")),
            resolvers: resolvers,
            csrfPrevention: true,
            cache: "bounded",
            plugins: [ApolloServerPluginDrainHttpServer({httpServer: this.http_server})]
        });
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

    public static createAndStart(resolvers?: { Query: any }, port: number = 4_000)
    {
        (new Server(resolvers ?? {
            Query: {
                default: (parent: any, args: any, context: any, info: any) => JSON.stringify({
                    context,
                    args
                })
            }
        }, port)).start().then(value => process.on("SIGINT", async () =>
        {
            await value.stop();
        }));
    }
}
