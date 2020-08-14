import { Container } from "typedi";

import * as zod from "zod";

import * as resourcesSchema from "../resourcesSchema";
import AlligatorService from "../alligator.service";
import ChatroomService from "../chatroom.service";
import ChatroomManagementService from "../chatroom-management.service";
import MessageService from "../message.service";
import AuthService from "../auth.service";
import { TUserTokenClaims } from "../../types/auth";


import { catchUnauthorized } from "./utils";


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

export async function getBasic(chatUserToken: string) {

    return catchUnauthorized(async () => {
        const claims = await authService.validateChatUserToken(chatUserToken);

        const chatroom = await chatroomService.getBasic(claims.slug);

        return chatroom ? {
            success: true,
            data: chatroom
        } : {
            success: false,
            error: "Not found"
        }
    });
    
}

export async function getDetailed(chatAdminToken: string) {
    
    return catchUnauthorized(async () => {
        
        const claims = await authService.validateChatAdminToken(chatAdminToken);

        const chatroom = await chatroomService.getDetailed(claims.slug);

        return chatroom ? {
            success: true,
            data: chatroom
        } : {
            success: false,
            error: "Not found"
        }
    })
}

export async function leave(chatUserToken: string) {
    
    return catchUnauthorized(async () => {

        const claims = await authService.validateChatUserToken(chatUserToken);

        await chatroomManagementService.kickUser(
            claims.slug, 
            claims.name
        );
    
        return {
            success: true
        }
    });
}

export async function clearMyMessages(chatUserToken: string) {
    return catchUnauthorized(async () => {

        const claims = await authService.validateChatUserToken(chatUserToken);
        
        const nDeleted = await messageService.clearOfUser(
            claims.slug,
            claims.name
        );

        return {
            success: true,
            data: {
                nDeleted
            }
        }
    })
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
        success: true
    }
}