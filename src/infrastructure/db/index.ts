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
import initMongodb, {
    ChatroomRepository as MongoChatroomRepository,
    MessageRepository as MongoMessageRepository
} from "./mongo";

import initNedb, { 
    ChatroomRepository as NedbChatroomRepository,
    MessageRepository as NedbMessageRepository,
    createBackup as nedbCreateBackup
 } from "./nedb";
import { TChatroomRepository, TMessageRepository } from "../../types/infrastructure";

export default function resolveDatabase(kind: "mongo" | "nedb"): TResolvedDatabase {

    switch(kind) {
        case "mongo": return resolveMongo();
        case "nedb": return resolveNedb();
    }

}

type TResolvedDatabase = {
    chatroomRepository: TChatroomRepository,
    messageRepository: TMessageRepository,
    initDatabase: () => Promise<any>,
    createBackup: (backupName: string) => any;
}

function resolveMongo(): TResolvedDatabase {
    return {
        chatroomRepository: new MongoChatroomRepository(),
        messageRepository: new MongoMessageRepository(),
        initDatabase: initMongodb,
        createBackup() {
            throw new Error("MONGODB BACKUPS NOT YET IMPLEMENTED");
        }
    }
}

function resolveNedb(): TResolvedDatabase {

    return {
        chatroomRepository: new NedbChatroomRepository(),
        messageRepository: new NedbMessageRepository(),
        initDatabase: initNedb,
        createBackup: nedbCreateBackup
    }
}