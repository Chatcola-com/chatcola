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
import { Container } from "typedi";

import ChatroomManagementService from "../chatroom-management.service";
import MessageService from "../message.service";

const chatroomManagementService = Container.get(ChatroomManagementService);
const messageService = Container.get(MessageService);

export async function kickUser(slug: string, user_name: string) {

    await chatroomManagementService.kickUser(slug, user_name);

    return {
        success: true,
        data: {}
    }
}

export async function revokeAccessToken(slug: string, targetToken: string) {
        
    await chatroomManagementService.revokeAccessToken(slug, targetToken);

    return {
        success: true,
        data: {}
    }
}

export async function generateAccessTokens(slug: string, amount: number) {

    await chatroomManagementService.generateAccessTokens(slug, amount);

    return {
        success: true,
        data: {}
    }
}

export async function remove(slug: string) {

    await Promise.all([
        chatroomManagementService.remove(slug),
        messageService.clearAll(slug)
    ])

    return {
        success: true,
        data: {}
    }
}

export async function clearAllMessages(slug: string) {

    const nDeleted = await messageService.clearAll(slug)

    return {
        success: true,
        data: {
            nDeleted
        }
    }
}