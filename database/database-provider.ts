import {PrismaClient} from "@prisma/client";

export const prismaClient = new PrismaClient();

export type dbOperation_type_<T> =
    {
        error: string;
        payload?: T;
    }
