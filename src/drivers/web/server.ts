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
import apiLoader from "./api";
import socketLoader from "./socket";

import fs from "fs";

import https from "https";


import config from "./config";

export default function bootstrapWebserver(port: number) {

    return new Promise( ( resolve ) => {

        const app = apiLoader();

        const server = https.createServer({ 
                key: fs.readFileSync(config.server.key_file_name),
                cert: fs.readFileSync(config.server.cert_file_name)
            }, app)
        
        socketLoader(server);

        server.listen(config.port, "0.0.0.0");

        server.on('listening', resolve);
    })
}