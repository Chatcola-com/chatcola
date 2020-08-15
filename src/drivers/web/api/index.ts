/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import connect from "connect";

import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";

import { IncomingMessage, ServerResponse } from "http";

import router from "../../../application/resources/router";


export default function bootstrapWebserver() {

    const app = connect();

    //@ts-ignore
    app.use(morgan("dev"));
    //@ts-ignore
    app.use(cors({origin: "*"}));

    app.use(bodyParser.json());

    app.use( async (req: IncomingMessage, res: ServerResponse) => {
        
        //@ts-ignore
        const body = req.body;
        const resourceUrl = req.url || "/";
        const [_, tokenType, token] = req.headers["authorization"]?.split(" ") || [null, null, null];

        const result = await router(
            resourceUrl,
            body,
            {
                tokenType: tokenType === "user" || tokenType === "admin" ? tokenType : undefined,
                token
            }
        )

        res.writeHead(200);
        res.end(JSON.stringify(result));
    })

    return app;
}