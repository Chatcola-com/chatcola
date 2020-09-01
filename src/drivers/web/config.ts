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
import path from 'path';
import fs from "fs";

import infraConfig from "../../infrastructure/config";

if(!process.env.PORT)
  process.env.PORT = "7777";


const config = {
  
  port: parseInt(process.env.PORT, 10),

  client_url: getClientUrl(),

  sentry_dsn: process.env.SENTRY_DSN,

  server: {
    key_file_name: path.resolve(infraConfig.assetsPath, "privkey.pem"),
    cert_file_name: path.resolve(infraConfig.assetsPath, "fullchain.pem")
  },
};

function getClientUrl() {
  switch(process.env.NODE_ENV) {
    case "production": return "https://chatcola.com";
    case "staging": return "https://chatcola.art-c.tech";
    default: return "http://localhost:3000";
  }
}

try {
  fs.readFileSync(config.server.key_file_name);
  fs.readFileSync(config.server.cert_file_name);
}
catch( err ) {
  console.error(`Error reading SSL keys: `, err.message);

  if(err.code === "ENOENT")
    process.exit(2);
  else
    throw err;
}


export default config;