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