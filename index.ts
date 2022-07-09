import {faker} from "@faker-js/faker";
import {Server} from "./server/apollo-server";

import {PrismaClient} from "@prisma/client";

Server.createAndStart();

let prisma = new PrismaClient();

prisma.agent.create({
    data:
        {
            forename: "george",
            email: "",
            surname: "",
            username: "",
            password_hash: ""
        }
});
