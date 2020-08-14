/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { HttpResponse, HttpRequest } from "uWebSockets.js";

import * as resourcesSchema from "../../../../application/resourcesSchema";

import * as chatroom from "../../../../application/use-cases/chatroom";
import * as message from "../../../../application/use-cases/messages";

const startNew = async (res: HttpResponse, req: HttpRequest) => {

    const details = resourcesSchema.createChatroom.parse(res.body);

    const result = await chatroom.create(details);

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify(result))
}

const getBasic = async (res: HttpResponse, req: HttpRequest) => {

    const chatUserToken = getTokenFromRes(res);

    const result = await chatroom.getBasic(chatUserToken);

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify(result));
}

const getDetailed = async (res: HttpResponse, req: HttpRequest) => {
    const chatAdminToken = getTokenFromRes(res);

    const result = await chatroom.getDetailed(chatAdminToken);

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify(result));
}

const getMessages = async (res: HttpResponse, req: HttpRequest) => {
    const chatUserToken = getTokenFromRes(res);

    const result = await message.getMessages(chatUserToken);

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify(result));
}

const leave = async (res: HttpResponse, req: HttpRequest) => {

    const result = await chatroom.leave(
        getTokenFromRes(res)
    );

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify(result))
}

const clearMyMessages = async (res: HttpResponse, req: HttpRequest) => {

    const result = await chatroom.clearMyMessages(
        getTokenFromRes(res)
    );
    
    res.writeStatus(`200 OK`);
    res.end(JSON.stringify(result))
}

const pushSubscribeToChatroom = async (res: HttpResponse, req: HttpRequest) => {

    const { pushSubscriptionToken, chatroomToken } = 
        resourcesSchema.pushAndChatroomTokens.parse(res.body);

    const result = await chatroom.addSubscriptionToUser(chatroomToken, pushSubscriptionToken);

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify(result));
}

function getTokenFromRes(res: HttpResponse): string {
    return res.headers?.[`Authorization`]?.split(" ")?.pop();
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