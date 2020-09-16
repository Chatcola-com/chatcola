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

import { TChatroomRepository } from "../types/infrastructure";

import ActiveSocketsManager from "./socket/activeSockets";

@Service()
export default class ChatroomManagementService {

    constructor(
        @Inject("chatroomRepository") private chatroomRepository: TChatroomRepository,
        private socketManager: ActiveSocketsManager
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

            const socket = this.socketManager.getSocketOfUser(
                chatroom.slug,
                user_name
            );

            if(!socket)
                return;

            socket.send({ type: "kick", data: {} })

            setTimeout(() => socket.close(), 1000);
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