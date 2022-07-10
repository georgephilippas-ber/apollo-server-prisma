import {RouterClass} from "../../router-interface";
import express from "express";

export class AuthenticationRouter extends RouterClass
{
    constructor()
    {
        super("authentication");

        this.express_router_.use(express.json());

        this.assign();
    }

    assign()
    {
        this.default();
    }

    default()
    {
        this.express_router_.all("/default", (req, res) =>
        {
            res.send(req.body);
        })
    }
}
