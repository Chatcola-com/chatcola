/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { EventEmitter } from "events";
import { Service, Inject } from "typedi";

import { TChatroomRepository } from "../types/infrastructure";

import events from "./events/events";

@Service()
export default class ChatroomManagementService {

    constructor(
        @Inject("chatroomRepository") private chatroomRepository: TChatroomRepository,
        @Inject("eventEmitter") private eventEmitter: EventEmitter
    ) {}

    async revokeAccessToken(slug: string, access_token: string) {
        const chatroom = await this.chatroomRepository.findBySlug(slug);
    
        if(!chatroom) return;
    
        chatroom.removeAccessToken(access_token);

        await this.chatroomRepository.persist(chatroom);
    }

    async kickUser(slug: string, user_name: string) {
        const chatroom = await this.chatroomRepository.findBySlug(slug);

        if(!chatroom) return;

        const userExisted = chatroom.banUser(user_name);

        if(userExisted) {
            await this.chatroomRepository.persist(chatroom);

            this.eventEmitter.emit(events.USER_KICKED_OUT, { slug, user_name });
        }
    }

    async remove(slug: string) {
        await this.chatroomRepository.deleteOne({ slug })
    }

    async generateAccessTokens(slug: string, amount: number) {
        const chatroom = await this.chatroomRepository.findBySlug(slug);

        if(!chatroom)
            return;

        chatroom.addAccessTokens(amount);

        await this.chatroomRepository.persist(chatroom);
    }
}