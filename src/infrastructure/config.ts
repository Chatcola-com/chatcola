/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright Antoni Papiewski and Milan Kazarka © 2020-----------------------------/*/
/*|-----------Distribution of this software is only permitted in accordance with the BSL 1.1 license-----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import dotenv from 'dotenv';
import appRoot from 'app-root-path';
import path from "path";
import os from "os";
import fs from "fs";

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const isProd = ["staging", "production"].includes(process.env.NODE_ENV?.toLowerCase() || "");

const assetsPath = isProd ? 
  path.resolve(os.homedir(), ".chatcola") :
  path.resolve(appRoot.path, "assets");

if(!fs.existsSync(assetsPath))
  fs.mkdirSync(assetsPath);

const dotenvPath = path.resolve(assetsPath, process.env.NODE_ENV.toLowerCase()+".env");

dotenv.config({
  path: dotenvPath
});

if(process.env.DATABASE === "mongo" && !process.env.MONGO_URI)
  throw new Error(`Please specify MONGO_URI in ${dotenvPath} or change DATABASE .env variable to "nedb"`);

if(!process.env.THIS_INSTANCE_ADDRESS)
  throw new Error(`Please specify THIS_INSTANCE_ADDRESS with cross-env or with -e flag if using docker`);

export default {
    database: getPrefferedDatabaseType(),

    inMemoryDatabase: process.env.NODE_ENV === "test",

    mongoURL: process.env.MONGO_URI,

    //A few files will be resolved from NEDB path - chatcola.nedb-chatrooms and chatcola.nedb-messages. 
    //It's rather a filename template, not a directory.
    nedbPath: path.resolve(assetsPath, "chatcola.nedb"),
    
    should_report_errors: Boolean(process.env.SHOULD_REPORT_ERRORS !== "false"),

    delegator_url: getDelegatorUrl(),

    this_instance_address: process.env.THIS_INSTANCE_ADDRESS,

    logs: {
        level: "debug",
    },
    
}

function getPrefferedDatabaseType(): "nedb" | "mongo" {
  if( process.env.DATABASE && ["nedb", "mongo"].includes(process.env.DATABASE))
    //@ts-ignore
    return process.env.DATABASE;

  return "nedb";
}

function getDelegatorUrl() {
  switch(process.env.NODE_ENV) {
    case "production": return "https://alligator.chatcola.com";
    case "staging": return "https://alligator.chatcola.art-c.tech";
    default: return "https://localhost:2112"
  }
}