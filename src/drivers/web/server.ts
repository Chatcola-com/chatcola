/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/

import apiLoader from "./api";
import socketLoader from "./socket";

import fs from "fs";

import http, { IncomingMessage, ServerResponse } from "http";
import https from "https";


import config from "./config";

export default function bootstrapWebserver(port: number) {

    return new Promise( ( resolve ) => {

        const app = apiLoader();

        const server = config.server.should_use_ssl ? 
            https.createServer({ 
                key: fs.readFileSync(config.server.key_file_name),
                cert: fs.readFileSync(config.server.cert_file_name)
            }, app)
        :
            http.createServer({}, app);

        socketLoader(server);

        server.listen(config.port, "0.0.0.0");

        server.on('listening', resolve);
    })
}