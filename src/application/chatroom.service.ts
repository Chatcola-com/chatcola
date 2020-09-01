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
