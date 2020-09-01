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
import NedbRepositoryFactory from "./repository-factory";
import Chatroom from "../../../application/entities/chatroom";
import Message from "../../../application/entities/message";
import { TChatroomRepository, TMessageRepository } from "../../../types/infrastructure";
export { default as NedbRepositoryFactory } from "./repository-factory";

import {
    ChatroomModel,
    MessageModel
} from "./models";

export default async function initNedb() {
    await Promise.all([
        ChatroomModel.model.load(),
        MessageModel.model.load()
    ])
}   

export class ChatroomRepository 
    extends NedbRepositoryFactory<Chatroom>(
        ChatroomModel.model, 
        ChatroomModel.serialize,
        ChatroomModel.deserialize
    )
    implements TChatroomRepository {

        async findBySlug(slug: string): Promise<Chatroom | null> {
            return this.findOne({ slug });
        }

};

export class MessageRepository 
    extends NedbRepositoryFactory<Message>(
        MessageModel.model, 
        MessageModel.serialize,
        MessageModel.deserialize
    )
    implements TMessageRepository {

};