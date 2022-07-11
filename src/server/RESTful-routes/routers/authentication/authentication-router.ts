import {RouterClass} from "../../router-interface";
import express, {NextFunction, Request, Response} from "express";
import {
    AgentManager,
    candidate_agent_type_,
    candidateAgent_withoutPasskey,
    candidateAgent_withPasskey
} from "../../../../database/managers/agent-manager";

import {getReasonPhrase, StatusCodes} from 'http-status-codes';
import {isolate, specifies} from "../../../../core/utilities/utilities";
import {SessionManager} from "../../../../database/managers/session-manager";
import {JwtManager} from "../../../../core/authentication/jwt-manager/jwt-manager";
import {Session} from "@prisma/client";

import morgan from "morgan";
import cors from 'cors';

let activeDefault: boolean = true;

let session_duration_: number = 0x0f;

export function authorizationJsonWebTokenMiddleware(jwtManager: JwtManager)
{
    async function middleware(req: Request, res: Response, next: NextFunction)
    {
        if (specifies(req.headers, ["Authorization".toLowerCase()]))
        {
            let token_: string = ((req.headers["Authorization".toLowerCase()] as string).split(" "))[1];

            if (token_)
            {
                let authentication_payload_ = jwtManager.obtain(token_);

                if (authentication_payload_)
                {
                    req.body =
                        {
                            ...req.body,
                            agentId: authentication_payload_.agentId,
                            sessionId: authentication_payload_.sessionId
                        }
                }
            }
        }

        next();
    }

    return middleware;
}

async function createSession(agentId: number, sessionManager: SessionManager, jwtManager: JwtManager, response_: Response, additionalResponseBodyContents: object = {})
{
    let session_ = await sessionManager.createSession(agentId, session_duration_);

    if (!session_.payload)
        response_.status(StatusCodes.INTERNAL_SERVER_ERROR).send({status: session_.error});
    else
    {
        let token = jwtManager.produce({
            agentId: agentId,
            sessionId: session_.payload.id,
            refresh: true,
        }, session_duration_);

        response_.status(StatusCodes.OK).send({token, ...additionalResponseBodyContents});
    }

    await sessionManager.deleteExpiredSessions(agentId);
}

export class AuthenticationRouter extends RouterClass
{
    agentManager: AgentManager;
    sessionManager: SessionManager;
    jwtManager: JwtManager;

    constructor(agentManager: AgentManager, sessionManager: SessionManager, jwtManager: JwtManager)
    {
        super("authentication");

        this.agentManager = agentManager;
        this.sessionManager = sessionManager;
        this.jwtManager = jwtManager;

        this.express_router_.use(morgan("short"));
        this.express_router_.use(cors());
        this.express_router_.use(express.json());
        this.express_router_.use(authorizationJsonWebTokenMiddleware(jwtManager));

        this.use();
    }

    use()
    {
        this.default();

        this.register();
        this.delete();

        this.login();
        this.logout();

        this.refresh();
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
            if (!specifies(req.body, ["credentials"]) || !Array.isArray(req.body["credentials"]) || req.body["credentials"].filter(value => typeof value === "string").length == 0)
                res.status(StatusCodes.BAD_REQUEST).send({status: getReasonPhrase(StatusCodes.BAD_REQUEST)});
            else
            {
                let credentials_ = req.body["credentials"].filter(value => typeof value === "string");

                let agent_ = await this.agentManager.authenticate(credentials_);

                if (!agent_)
                    res.status(StatusCodes.FORBIDDEN).send({status: getReasonPhrase(StatusCodes.FORBIDDEN)});
                else
                    await createSession(agent_.id, this.sessionManager, this.jwtManager, res, {
                        username: agent_.username,
                        email: agent_.email,
                        forename: agent_.forename,
                        surname: agent_.surname
                    });
            }
        });
    }

    logout()
    {
        this.express_router_.post("/logout", async (req, res) =>
        {
            console.log(req.body.agentId, req.body.sessionId);

            if (specifies(req.headers, ["Authorization".toLowerCase()]))
            {
                let jwt_payload_ = this.jwtManager.obtain((req.headers["Authorization".toLowerCase()] as string).split(" ")[1]);

                if (!jwt_payload_)
                    res.status(StatusCodes.UNAUTHORIZED).send({status: getReasonPhrase(StatusCodes.UNAUTHORIZED)});
                else
                {
                    let session_: Session | null = (await this.sessionManager.deleteSessionById(jwt_payload_.sessionId)).payload;

                    if (!session_ || (session_.agentId !== jwt_payload_.agentId))
                        res.status(StatusCodes.OK).send({status: "invalid session"});
                    else
                        res.status(StatusCodes.OK).send();
                }
            } else
                res.status(StatusCodes.BAD_REQUEST).send({status: getReasonPhrase(StatusCodes.BAD_REQUEST)});
        });
    }

    refresh()
    {
        this.express_router_.post("/refresh", async (req, res) =>
        {
            if (specifies(req.body, ["agentId", "sessionId"]))
            {
                await this.sessionManager.deleteSessionById(req.body["sessionId"]);

                let agent_ = await this.agentManager.byId(req.body["agentId"]);

                if (!agent_)
                    res.status(StatusCodes.FORBIDDEN).send({status: getReasonPhrase(StatusCodes.FORBIDDEN)});
                else
                    await createSession(agent_.id, this.sessionManager, this.jwtManager, res);
            } else
                res.status(StatusCodes.FORBIDDEN).send();
        });
    }
}
