import {RouterClass} from "../../router-interface";
import express from "express";

export class AuthenticationRouter extends RouterClass
{
    constructor()
    {
        super("authentication");

        this.express_router_.use(express.json());

        this.use();
    }

    use()
    {
        this.default();
    }

    default()
    {
        this.express_router_.all("/", (req, res) =>
        {
            res.send({...req.headers});
        })
    }
}
