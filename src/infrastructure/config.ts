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
import dotenv from 'dotenv';
import appRoot from 'app-root-path';
import path from "path";
import os from "os";
import fs from "fs";

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const isProd = ["staging", "production"].includes(process.env.NODE_ENV?.toLowerCase() || "");

const assetsPath = isProd ? 
  path.resolve(os.homedir(), `.chatcola-${getDriverType()}`) :
  path.resolve(appRoot.path, `assets-${getDriverType()}`);

if(!fs.existsSync(assetsPath))
  fs.mkdirSync(assetsPath);

const dotenvPath = path.resolve(assetsPath, process.env.NODE_ENV.toLowerCase()+".env");

dotenv.config({ path: dotenvPath });

if(process.env.DATABASE === "mongo" && !process.env.MONGO_URI) {
  console.error(`Please specify MONGO_URI in ${dotenvPath} or change DATABASE .env variable to "nedb"`);
  process.exit(1);
}


export default {

    isProd,

    database: getPrefferedDatabaseType(),

    assetsPath,

    inMemoryDatabase: process.env.NODE_ENV === "test" || process.env.MEMORY === "true",

    mongoURL: process.env.MONGO_URI,

    nedbPathChatrooms: path.resolve(assetsPath, "chatcola-chatrooms.nedb"),
    nedbPathMessages: path.resolve(assetsPath, "chatcola-messages.nedb"),    
    
    should_report_errors: Boolean(
      isProd && 
      process.env.SHOULD_REPORT_ERRORS !== "false"  
    ),

    alligator_url: getAlligatorUrl(),

    logs: {
        level: "debug",
    },

    driver: getDriverType(),
    
}

function getDriverType(): "http" | "webrtc" {
  if(process.env.CHATCOLA_DRIVER && ["http", "webrtc"].includes(process.env.CHATCOLA_DRIVER))
    //@ts-ignore
    return process.env.CHATCOLA_DRIVER;

  return "webrtc";
}

function getPrefferedDatabaseType(): "nedb" | "mongo" {
  if( process.env.DATABASE && ["nedb", "mongo"].includes(process.env.DATABASE))
    //@ts-ignore
    return process.env.DATABASE;

  return "nedb";
}

function getAlligatorUrl() {
  switch(process.env.NODE_ENV) {
    case "production": return "alligator.chatcola.com";
    case "staging": return "alligator.chatcola.art-c.tech";
    default: return "localhost:2112"
  }
}