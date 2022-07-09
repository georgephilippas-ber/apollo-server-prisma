import {faker} from "@faker-js/faker";
import {Server} from "./src/server/apollo-server";

import {PrismaClient} from "@prisma/client";

Server.createAndStart();
