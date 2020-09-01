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

import * as zod from "zod";

import * as resourcesSchema from "./schema";
import AlligatorService from "../alligator.service";
import ChatroomService from "../chatroom.service";
import ChatroomManagementService from "../chatroom-management.service";
import MessageService from "../message.service";
import AuthService from "../auth.service";
import { TUserTokenClaims } from "../../types/auth";


const alligatorService = Container.get(AlligatorService);
const chatroomService = Container.get(ChatroomService);
const chatroomManagementService = Container.get(ChatroomManagementService);
const messageService = Container.get(MessageService);
const authService = Container.get(AuthService);

export async function create(details: zod.infer< typeof resourcesSchema.createChatroom >) {

    const chatroom = await chatroomService.new(details);

    const { slug, valid_until } = chatroom;

    await alligatorService.putChatroomCard({ slug, valid_until });

    return {
        success: true,
        data: {
            chatroom
        }
    }
}

export async function getBasic(slug: string) {

    const chatroom = await chatroomService.getBasic(slug);

    return chatroom ? {
        success: true,
        data: {
            chatroom
        }
    } : {
        success: false,
        error: "Not found",
        data: {}
    }
    
}

export async function getDetailed(slug: string) {
    
    const chatroom = await chatroomService.getDetailed(slug);

    return chatroom ? {
        success: true,
        data: {
            chatroom
        }
    } : {
        success: false,
        error: "Not found",
        data: {}
    }
}

export async function leave(slug: string, name: string) {
    
    await chatroomManagementService.kickUser(
        slug, 
        name
    );

    return {
        success: true,
        data: {}
    }
}

export async function clearMyMessages(slug: string, name: string) {

    const nDeleted = await messageService.clearOfUser(
        slug,
        name
    );

    return {
        success: true,
        data: {
            nDeleted
        }
    }
}


export async function addSubscriptionToUser(chatroomToken: string, pushSubscriptionToken: string) {

    const chatroomClaimsPromise = 
            <Promise<TUserTokenClaims>>authService.validateChatToken(chatroomToken);

    const subscriptionIdPromise = 
        alligatorService.validatePushSubscriptionToken(pushSubscriptionToken);

    const [chatroomClaims, subscriptionId] 
        = await Promise.all([chatroomClaimsPromise, subscriptionIdPromise]);

    await chatroomService.addSubscriptionToUser({
        subscriptionId: subscriptionId,
        chatroomSlug: chatroomClaims.slug,
        userName: chatroomClaims.name
    });

    return {
        success: true,
        data: {}
    }
}
