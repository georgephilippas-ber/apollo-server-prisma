import {Agent, Session, PrismaClient} from "@prisma/client";

export const prismaClient = new PrismaClient();

export type CRUD_operation_result_type_ =
    {
        error?: string;
        payload?: Agent | Session;
    }
