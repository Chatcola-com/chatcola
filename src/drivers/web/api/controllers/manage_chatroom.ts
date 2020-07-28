/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { HttpResponse, HttpRequest } from "uWebSockets.js";
import { Container } from "typedi";

import MessageService from "../../../../application/message.service";
import ChatroomManagementService from "../../../../application/chatroom-management.service";

const chatroomManagementService = Container.get(ChatroomManagementService);
const messageService = Container.get(MessageService);

const clearChatroomMessages = async (res: HttpResponse, req: HttpRequest) => {

    const nDeleted = await messageService.clearAll( res.claims.slug );

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify({
        success: true,
        data: {
            nDeleted
        }
    }))
}

const deleteChatroom = async (res: HttpResponse, req: HttpRequest) => {

    const slug = res.claims.slug;

    await Promise.all([chatroomManagementService.remove( slug ), messageService.clearAll( slug )]);

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify({
        success: true
    }))
}

const kickUser = async (res: HttpResponse, req: HttpRequest) => {

    await chatroomManagementService.kickUser(
        res.claims.slug,
        res.params["user_name"]
    );

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify({
        success: true
    }));
}

const revokeToken = async (res: HttpResponse, req: HttpRequest) => {

    const targetToken = res.params["token"];

    await chatroomManagementService.revokeAccessToken(
        res.claims.slug, 
        targetToken
    );

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify({
        success: true
    }));
}

const generateAccessTokens = async (res: HttpResponse, req: HttpRequest) => {

    await chatroomManagementService.generateAccessTokens(res.claims.slug, res.body.amount);

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify({
        success: true
    }));
}


export default {
    clearChatroomMessages,
    deleteChatroom,
    kickUser,
    revokeToken,
    generateAccessTokens
}