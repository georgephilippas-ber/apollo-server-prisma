import {RouterClass} from "../../router-interface";
import express from "express";
import {
    AgentManager,
    candidate_agent_type_,
    candidateAgent_withoutPasskey, candidateAgent_withPasskey
} from "../../../../database/managers/agent-manager";

import {StatusCodes, getReasonPhrase} from 'http-status-codes';
import {isolate, specifies} from "../../../../core/utilities/utilities";

let activeDefault: boolean = true;

export class AuthenticationRouter extends RouterClass
{
    agentManager: AgentManager;

    constructor(agentManager: AgentManager)
    {
        super("authentication");

        this.agentManager = agentManager;

        this.express_router_.use(express.json());

        this.use();
    }

    use()
    {
        this.default();

        this.register();
        this.delete();

        this.login();
    }

    default()
    {
        this.express_router_.all("/", (req, res) =>
        {
            res.send({...req.headers});
        })
    }

    register()
    {
        this.express_router_.post("/register", async (req, res) =>
        {
            if (specifies(req.body, Object.keys(candidateAgent_withoutPasskey)))
            {
                let candidateAgent = isolate(req.body, Object.keys(candidateAgent_withPasskey)) as candidate_agent_type_;

                let CRUD_result_ = await this.agentManager.insertAgent(candidateAgent, activeDefault);

                if (CRUD_result_.error)
                    res.status(StatusCodes.CONFLICT).send({status: CRUD_result_.error});
                else
                    res.status(StatusCodes.OK).send({status: getReasonPhrase(StatusCodes.OK)});
            } else
            {
                let error_: string[] = [];

                if (!req.body["email"])
                    error_.push("!email");
                if (!req.body["username"])
                    error_.push("!username");
                if (!req.body["password"])
                    error_.push("!password");

                res.status(StatusCodes.BAD_REQUEST).send({status: error_.join(", ")});
            }
        });
    }

    delete()
    {
        this.express_router_.delete("/delete", async (req, res) =>
        {
            if (specifies(req.body, ["identifier"]))
            {
                if (typeof req.body["identifier"] === "string")
                {
                    let CRUD_result_ = await this.agentManager.deleteBy(req.body["identifier"]);

                    if (CRUD_result_.error)
                        res.status(StatusCodes.CONFLICT).send({status: CRUD_result_.error});
                    else
                        res.status(StatusCodes.OK).send({status: getReasonPhrase(StatusCodes.OK)});
                } else
                    res.status(StatusCodes.BAD_REQUEST).send({status: "!string"});
            } else
                res.status(StatusCodes.BAD_REQUEST).send({status: "!identifier"});
        });
    }

    login()
    {
        this.express_router_.post("/login", async (req, res) =>
        {
            if (!specifies(req.body, ["credentials"]) || !Array.isArray(req.body["credentials"]) || req.body["credentials"].length == 0)
                res.status(StatusCodes.BAD_REQUEST).send({status: getReasonPhrase(StatusCodes.BAD_REQUEST)});
            else
            {
                res.send({well: (await this.agentManager.authenticate(req.body["credentials"]))?.username});
            }
        });
    }
}
