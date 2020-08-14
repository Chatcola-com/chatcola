/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { TemplatedApp, HttpResponse, HttpRequest } from "uWebSockets.js";

import parseBody from "./parseBody";

import router from "../../../application/resources/router";

export default function bootstrapHttp(app: TemplatedApp) {

    app.any("/*", async (res: HttpResponse, req: HttpRequest) => {

        res.onAborted(() => {
            res.isAborted = true;
        });

        writeCorsHeaders(res);

        const [_, tokenType, token] = req.getHeader("authorization").split(" ");
        const resourceUrl = req.getUrl();

        if(req.getMethod().toLowerCase() !== "get")
            await parseBody(res, req);
        
        const result = await router(
            resourceUrl,
            res.body,
            {
                chatroomToken: tokenType === "user" ? token : undefined,
                adminToken: tokenType === "admin" ? token : undefined
            }
        )
        
        if(res.isAborted)  
            return;
        res.writeStatus(`200 OK`);
        res.end(JSON.stringify(result))
    });

    app.options(`/*`, options);

}

function writeCorsHeaders(res: HttpResponse) {
    res.writeHeader(`Access-Control-Allow-Origin`, "*");
    res.writeHeader(`Access-Control-Allow-Methods`, `*`);
    res.writeHeader(`Access-Control-Allow-Headers`, `*`);
    res.writeHeader(`Access-Control-Max-Age`, `-1`);
}

function options (res: HttpResponse, req: HttpRequest) {
    writeCorsHeaders(res);
    res.end();
}