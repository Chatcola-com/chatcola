/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
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

if(config.server.key_file_name) {

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

}

export default config;