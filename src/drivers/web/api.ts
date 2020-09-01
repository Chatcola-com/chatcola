/*
|    For alternative licensing arrangements contact us at freedom@chatcola.com
|--------------------------------------------------------------------------------  
|    This file is part of chatcola.com server
|    Copyright (C) 2020 Antoni Papiewski & Milan Kazarka
|
|    This program is free software: you can redistribute it and/or modify
|    it under the terms of the GNU Affero General Public License as published by
|    the Free Software Foundation, either version 3 of the License, or
|    (at your option) any later version.
|
|    This program is distributed in the hope that it will be useful,
|    but WITHOUT ANY WARRANTY; without even the implied warranty of
|    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
|    GNU Affero General Public License for more details.
|
|    You should have received a copy of the GNU Affero General Public License
|    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import connect, { NextFunction } from "connect";

import bodyParser from "body-parser";
import morgan from "morgan";

import { IncomingMessage, ServerResponse } from "http";

import router from "../../application/resources/router";

export default function bootstrapWebserver() {

    const app = connect();


    app.use(bodyParser.json());

    //@ts-ignore
    app.use(morgan("dev"));

    app.use((req: IncomingMessage, res: ServerResponse, next: NextFunction) => {

        res.setHeader(`Access-Control-Allow-Origin`, `*`);
        res.setHeader(`Access-Control-Allow-Methods`, `*`);
        res.setHeader(`Access-Control-Allow-Headers`, `*`)
        res.setHeader(`Access-Control-Allow-Origin`, `*`);
        res.setHeader(`Access-Control-Max-Age`, `3600`);

        next();
    });


    app.use( async (req: IncomingMessage, res: ServerResponse, next: NextFunction) => {        
        //@ts-ignore
        const body = req.body;
        const resourceUrl = req.url || "/";
        const [_, token] = req.headers["authorization"]?.split(" ") || [null, null];

        const result = await router(
            resourceUrl,
            body,
            { token }
        )

        res.writeHead(200);
        res.end(JSON.stringify(result));
    })

    return app;
}