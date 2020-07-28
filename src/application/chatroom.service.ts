/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { Service, Inject } from "typedi";

import Chatroom from "./entities/chatroom";
import { TChatroomRepository } from "../types/infrastructure";
import events from "./events/events";
import { EventEmitter } from "events";

@Service() 
export default class ChatroomService {

    constructor(
        @Inject("chatroomRepository") private chatroomRepository: TChatroomRepository,
        @Inject("eventEmitter") private eventEmitter: EventEmitter
    ) {};

    async getBasic(slug: string) {

        const chatroom = await this.chatroomRepository.findBySlug(slug);

        if(!chatroom)
            return null;

        const { name, users, auth_type } = chatroom;

        return {
            name, users, slug, auth_type
        };
    }

    async getDetailed(slug: string) {

        const chatroom = await this.chatroomRepository.findBySlug(slug);

        if(!chatroom)
            return null;

        const { name, users, auth_type, access_tokens, banned_users } = chatroom;

        return {
            name, users, auth_type, access_tokens, banned_users
        }; 
    }

    async new(chatroomDetails: { name: string;
        valid_until: number; max_users: number; 
        auth_type: "none" | "access_tokens"; access_tokens_amount: number; }) {

        const chatroom = Chatroom.createNew(chatroomDetails);

        await this.chatroomRepository.save(chatroom);

        this.eventEmitter.emit(events.NEW_CHATROOM, chatroom);

        return chatroom;
    }

    async addSubscriptionToUser ({ chatroomSlug, subscriptionId, userName }: {
        chatroomSlug: string;
        subscriptionId: string;
        userName: string;
    }) {
        const chatroom = await this.chatroomRepository.findBySlug(chatroomSlug);
    
        if(!chatroom)
            return;
        
        chatroom.assignSubscriptionIdToUser(subscriptionId, userName);
    
        await this.chatroomRepository.persist(chatroom);
    }

    async getPushSubscribersIds (slug: string, excludeUserName?: string): Promise< string[] > {

        const chatroom = await this.chatroomRepository.findBySlug(slug);
    
        if(!chatroom)   
            return [];
    
        const subscriptionIds: Array<string> = [];
    
        chatroom.users.forEach( (user) => {    
            if(excludeUserName && user.name === excludeUserName)
                return;

            let { subscription_id } = user;
    
            if(!subscription_id)
                return;
                
            subscriptionIds.push(subscription_id);
        });

        return subscriptionIds;
    }

    async clearExpired() {          
        await this.chatroomRepository.deleteMany({
            valid_until: {
                $lte: Date.now()
            }
        });
    }
}
