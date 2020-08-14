/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { HttpResponse, HttpRequest } from "uWebSockets.js";

import * as resourceSchemas from "../../../../application/resourcesSchema";

import * as chatroomManagement from "../../../../application/use-cases/chatroom-management";
import chatroom from "./chatroom";

const clearChatroomMessages = async (res: HttpResponse, req: HttpRequest) => {

    const result = await chatroomManagement.clearAllMessages(
        getTokenFromRes(res)
    )

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify(result))
}

const deleteChatroom = async (res: HttpResponse, req: HttpRequest) => {

    const result = await chatroomManagement.remove(
        getTokenFromRes(res)
    );

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify(result))
}

const kickUser = async (res: HttpResponse, req: HttpRequest) => {

    const { user_name } = resourceSchemas.kickUser.parse(res.body);

    const result = await chatroomManagement.kickUser(
            res.claims.slug,
            user_name
        );

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify(result));
}

const revokeToken = async (res: HttpResponse, req: HttpRequest) => {

    const { targetToken } = resourceSchemas.revokeToken.parse(res.body);

    const result = await chatroomManagement.revokeAccessToken(
        getTokenFromRes(res), 
        targetToken
    );

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify(result));
}

const generateAccessTokens = async (res: HttpResponse, req: HttpRequest) => {

    const { amount } = resourceSchemas.generateAccessTokens.parse(res.body);

    const result = await chatroomManagement.generateAccessTokens(
        getTokenFromRes(res),
        amount
    );

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify(result));
}

function getTokenFromRes(res: HttpResponse): string {
    return res.headers?.[`Authorization`]?.split(" ")?.pop();
}

export default {
    clearChatroomMessages,
    deleteChatroom,
    kickUser,
    revokeToken,
    generateAccessTokens
}