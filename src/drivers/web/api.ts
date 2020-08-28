/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
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