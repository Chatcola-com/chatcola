/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import MemorySync from "lowdb/adapters/Memory";

import path from 'path';

import { TKeyValueStore } from "../../types/infrastructure";

import config from "../config";

let adapter: typeof MemorySync | typeof FileSync;

if(config.inMemoryDatabase)
    adapter = new MemorySync("chatcola")
else 
    adapter = new FileSync( path.resolve( config.assetsPath, "chatcola.json" ) );

const db = low(adapter);

db.defaults({}).write();

const keyValueStore: TKeyValueStore = {
    getItem(key: string) {
        try {
            return JSON.parse(db.get(key).value());
        }
        catch {
            return null;
        }
    },
    setItem(key: string, val: any) {
        db.set(key, JSON.stringify(val)).write();
    }
} 

export default keyValueStore;