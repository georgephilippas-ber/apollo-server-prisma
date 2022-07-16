import express, {Router} from "express";

export class RouterClass
{
    express_router_: Router;

    endpoint_: string;

    constructor(endpoint_: string)
    {
        this.express_router_ = express.Router();

        this.endpoint_ = endpoint_;
    }

    getRouter(): Router
    {
        return this.express_router_;
    }

    getEndpoint(): string
    {
        return this.endpoint_;
    }
}

export class Routers
{
    routers_: RouterClass[];

    constructor(routers_: RouterClass[])
    {
        this.routers_ = routers_;
    }

    getRouters(): RouterClass[]
    {
        return this.routers_;
    }

    add(router_: RouterClass)
    {
        this.routers_.push(router_);

        return this;
    }
}
