/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright Antoni Papiewski and Milan Kazarka © 2020-----------------------------/*/
/*|-----------Distribution of this software is only permitted in accordance with the BSL 1.1 license-----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/import dotenv from 'dotenv';
import appRoot from 'app-root-path';
import path from "path";

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const isProd = ["staging", "production"].includes(process.env.NODE_ENV?.toLowerCase());

const assetsPath = path.resolve(
  appRoot.path,
  isProd ? "../assets" : "assets"
);

const dotenvPath = path.resolve(assetsPath, process.env.NODE_ENV.toLowerCase()+".env");

const envFound = dotenv.config({
  path: dotenvPath
});


if (envFound.error) 
  throw new Error(`⚠️  Couldn't find ${process.env.NODE_ENV.toLowerCase()}.env file at path ${dotenvPath} ⚠️`);

if(process.env.DATABASE === "mongo" && !process.env.MONGO_URI)
  throw new Error(`Please specify MONGO_URI in ${dotenvPath} or change DATABASE .env variable to "nedb"`);

if(!process.env.JWT_SECRET)
  throw new Error(`Please specify JWT_SECRET in ${dotenvPath}`);

if(!process.env.THIS_INSTANCE_ADDRESS)
  throw new Error(`Please specify THIS_INSTANCE_ADDRESS in ${dotenvPath}`);

export default {
    database: getPrefferedDatabaseType(),

    inMemoryDatabase: process.env.NODE_ENV === "test",

    mongoURL: process.env.MONGO_URI,

    //A few files will be resolved from NEDB path - chatcola.nedb-chatrooms and chatcola.nedb-messages. 
    //It's rather a filename template, not a directory.
    nedbPath: path.resolve(assetsPath, "chatcola.nedb"),

    jwtSecret: process.env.JWT_SECRET,
    
    should_report_errors: Boolean(process.env.SHOULD_REPORT_ERRORS === "true"),

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