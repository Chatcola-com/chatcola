/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { Container } from "typedi";

import { HttpResponse, HttpRequest } from "uWebSockets.js";
import { AppError } from "../../../../infrastructure/utils";

import MessageService from "../../../../application/message.service";
import ChatroomService from "../../../../application/chatroom.service";
import ChatroomManagementService from "../../../../application/chatroom-management.service";
import AlligatorService from "../../../../application/alligator.service";
import AuthService from "../../../../application/auth.service";

import { TUserTokenClaims } from "types/auth";

const chatroomService = Container.get(ChatroomService);
const alligatorService = Container.get(AlligatorService);
const authService = Container.get(AuthService);
const chatroomManagementService = Container.get(ChatroomManagementService);
const messageService = Container.get(MessageService);

const startNew = async (res: HttpResponse, req: HttpRequest) => {

    const chatroom = await chatroomService.new(res.body);

    const { slug, valid_until } = chatroom;

    await alligatorService.putChatroomCard({ slug, valid_until });

    res.writeStatus(`200 OK`);

    res.end(JSON.stringify({
        success: true,
        data: {
            chatroom
        }
    }))
}

const getBasic = async (res: HttpResponse, req: HttpRequest) => {
    const chatroom = await chatroomService.getBasic(res.claims.slug);

    if(!chatroom) 
        throw new AppError("Not found");

    res.writeStatus(`200 OK`);

    res.end(JSON.stringify({
        success: true,
        data: chatroom
    }))
}

const getDetailed = async (res: HttpResponse, req: HttpRequest) => {
    const chatroom = await chatroomService.getDetailed(res.claims.slug);

    if(!chatroom) 
        throw new AppError("Not found");
    
    res.writeStatus(`200 OK`);

    res.end(JSON.stringify({
        success: true,
        data: chatroom
    }))
}

const getMessages = async (res: HttpResponse, req: HttpRequest) => {
   
    const messages = await messageService.get(res.claims.slug);
    
    res.writeStatus(`200 OK`);

    res.end(JSON.stringify({
        success: true,
        data: messages
    }))
}

const leave = async (res: HttpResponse, req: HttpRequest) => {

    await chatroomManagementService.kickUser(
        res.claims.slug, 
        res.claims.name
    );

    res.writeStatus(`200 OK`);

    res.end(JSON.stringify({
        success: true
    }))
}

const clearMyMessages = async (res: HttpResponse, req: HttpRequest) => {

    const nDeleted = await messageService.clearOfUser(
        res.claims.slug, 
        res.claims.name
    );

    res.writeStatus(`200 OK`);

    res.end(JSON.stringify({
        success: true,
        data: {
            nDeleted
        }
    }))
}

const pushSubscribeToChatroom = async (res: HttpResponse, req: HttpRequest) => {

    try {
        const chatroomClaimsPromise = 
            <Promise<TUserTokenClaims>>authService.validateChatToken(res.body.chatroomToken);

        const subscriptionIdPromise = 
            alligatorService.validatePushSubscriptionToken(res.body.pushSubscriptionToken);

        const [chatroomClaims, subscriptionId] 
            = await Promise.all([chatroomClaimsPromise, subscriptionIdPromise]);

        await chatroomService.addSubscriptionToUser({
            subscriptionId: subscriptionId,
            chatroomSlug: chatroomClaims.slug,
            userName: chatroomClaims.name
        });

        res.end(JSON.stringify({
            success: true
        }))
    }
    catch ( error ) {

        if(error.message === "Unauthorized") {
            res.end(JSON.stringify({
                success: false,
                error: "Unauthorized",
                data: {}
            }))
        }
        else 
            throw error;
    }
}

export default {
    startNew,
    getBasic,
    getDetailed,
    getMessages,
    leave,
    clearMyMessages,
    pushSubscribeToChatroom
}