import {faker} from "@faker-js/faker";
import {Server} from "./server/apollo-server";

import {PrismaClient} from "@prisma/client";

Server.createAndStart();
