/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import path from 'path';
import appRoot from "app-root-path";
import fs from "fs";

if(!process.env.PORT)
  throw new Error(`Please specify PORT in ${process.env.NODE_ENV?.toLowerCase()}.env file`);


const isProd = ["staging", "production"].includes(process.env.NODE_ENV?.toLowerCase() || "");

const assetsPath = path.resolve(
  appRoot.path,
  isProd ? "../assets" : "assets"
);

const config = {
  
  port: parseInt(process.env.PORT, 10),

  client_url: process.env.CLIENT_URL,

  sentry_dsn: process.env.SENTRY_DSN,

  server: {
    key_file_name: path.resolve(assetsPath, "privkey.pem"),
    cert_file_name: path.resolve(assetsPath, "fullchain.pem")
  },
};

if(config.server.key_file_name) {

  try {
    fs.readFileSync(config.server.key_file_name);
    fs.readFileSync(config.server.cert_file_name);
  }
  catch( err ) {
    console.error(`Error reading SSL keys: `, err);

    throw err;
  }

}

export default config;