import {PrismaClient} from "@prisma/client";

export const prismaClient = new PrismaClient();

export type dbOperation_type_ =
    {
        error: string;
        payload?: any;
    }
