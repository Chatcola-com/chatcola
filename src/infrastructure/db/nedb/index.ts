/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
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