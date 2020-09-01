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
