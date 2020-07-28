/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import initMongodb, {
    ChatroomRepository as MongoChatroomRepository,
    MessageRepository as MongoMessageRepository
} from "./mongo";

import initNedb, { 
    ChatroomRepository as NedbChatroomRepository,
    MessageRepository as NedbMessageRepository
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
    initDatabase: () => Promise<any>
}

function resolveMongo(): TResolvedDatabase {
    return {
        chatroomRepository: new MongoChatroomRepository(),
        messageRepository: new MongoMessageRepository(),
        initDatabase: initMongodb
    }
}

function resolveNedb(): TResolvedDatabase {

    return {
        chatroomRepository: new NedbChatroomRepository(),
        messageRepository: new NedbMessageRepository(),
        initDatabase: initNedb
    }
}