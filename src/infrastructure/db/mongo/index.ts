/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import mongoose from "mongoose";

import config from "../../config";

import MongoRepositoryFactory from "./repository-factory";

import {
    ChatroomModel,
    MessageModel
} from "./models";


import { TChatroomRepository, TMessageRepository } from "../../../types/infrastructure";
import Chatroom from "../../../application/entities/chatroom";
import Message from "../../../application/entities/message";

export default async () => {
    
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose.set('useUnifiedTopology', true);

    //@ts-ignore
    await mongoose.connect(config.mongoURL);
}

export class ChatroomRepository 
    extends MongoRepositoryFactory<Chatroom>(
        ChatroomModel.model,
        ChatroomModel.serialize,
        ChatroomModel.deserialize
    )       
    implements TChatroomRepository {

    async findBySlug(slug: string) {
        return this.findOne({ slug });
    }

}
export class MessageRepository 
    extends MongoRepositoryFactory<Message>(
        MessageModel.model,
        MessageModel.serialize,
        MessageModel.deserialize
    )       
    implements TMessageRepository {

}
