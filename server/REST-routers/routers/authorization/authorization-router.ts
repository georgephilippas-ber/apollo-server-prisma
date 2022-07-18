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
import {JwtManager} from "../../../../core/authorization/jwt-manager/jwt-manager";
import {Session} from "@prisma/client";

import morgan from "morgan";
import cors from 'cors';

let activeDefault: boolean = true;

let session_duration_: number = 0x0f;

let geheimnis_: string = "berlin";


export function authorizationJsonWebTokenMiddleware(jwtManager: JwtManager)
{
    async function middleware(req: Request, res: Response, next: NextFunction)
    {
        let token_: string = getAuthorizationToken(req);

        if (token_)
        {
            let jwtDecode = jwtManager.decode(token_);

            if (jwtDecode.isAuthorizationPayload && jwtDecode.payload)
            {
                req.body = {
                    ...req.body,

                    session: jwtDecode.payload,
                    validSessionJSONWebToken: jwtDecode.valid
                }
            }
        }

        next();
    }

    return middleware;
}

function getAuthorizationToken(req: Request, header: string = "Authorization"): string
{
    if (req.headers[header.toLowerCase()])
    {
        let header_: string = typeof req.headers[header.toLowerCase()] === "string" ? req.headers[header.toLowerCase()] as string : "";

        let token_ = header_.split(" ")[1];

        return token_ ?? "";
    } else
        return "";
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
            canRefresh: true,
        }, session_duration_);

        response_.status(StatusCodes.OK).send({token, ...additionalResponseBodyContents});
    }

    await sessionManager.deleteExpiredSessions(agentId);
}

export class AuthorizationRouter extends RouterClass
{
    agentManager: AgentManager;
    sessionManager: SessionManager;
    jwtManager: JwtManager;

    constructor(agentManager: AgentManager, sessionManager: SessionManager, jwtManager: JwtManager)
    {
        super("authorization");

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

        this.secret();
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

    delete() //by username || e-mail
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
                    });
            }
        });
    }

    logout()
    {
        this.express_router_.post("/logout", async (req, res) =>
            {
                if (req.body.session)
                {
                    let session_: Session | undefined = (await this.sessionManager.deleteSessionById(req.body.session?.sessionId ?? -1)).payload;

                    if (!session_ || (session_.agentId !== req.body.session?.agentId))
                        res.status(StatusCodes.OK).send({status: "invalid session"});
                    else
                        res.status(StatusCodes.OK).send();
                } else
                    res.status(StatusCodes.EXPECTATION_FAILED).send();
            }
        );
    }

    refresh()
    {
        this.express_router_.post("/refresh", async (req, res) =>
        {
            if (req.body.session && req.body.validSessionJSONWebToken)
            {
                let sessionId = req.body.session["sessionId"], agentId = req.body.session["agentId"];

                if (await this.sessionManager.isSessionValid(sessionId, agentId))
                {
                    await this.sessionManager.deleteSessionById(sessionId);

                    await createSession(agentId, this.sessionManager, this.jwtManager, res);
                } else
                {
                    res.status(StatusCodes.FORBIDDEN).send({status: "invalid session"});
                }
            } else
                res.status(StatusCodes.FORBIDDEN).send({status: "JSON Web Token expired"});
        });
    }

    secret()
    {
        this.express_router_.get("/secret", (req, res) =>
        {
            if (req.query["secret"] === geheimnis_)
                res.status(StatusCodes.OK).send({secretOrPrivateKey: this.jwtManager.getSecretOrPrivateKey()});
            else
                res.status(StatusCodes.FORBIDDEN).send({status: getReasonPhrase(StatusCodes.FORBIDDEN)});
        })
    }
}
