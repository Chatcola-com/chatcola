/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { TemplatedApp } from "uWebSockets.js";

import { HttpMiddlewares as middlewares } from "karuzela";
import carousel, { authenticateForChatroom, ensureIsAdmin, validateBody } from "../middlewares";


import Controller from "../controllers/manage_chatroom";

export default (app: TemplatedApp): void => {

    app.post(`/api/chatroom/clear_messages`, 
            carousel(
                [
                    authenticateForChatroom,
                    ensureIsAdmin,
                    Controller.clearChatroomMessages
                ]
            )
    )

    app.post(`/api/chatroom/delete`,
        carousel(
            [
                Controller.deleteChatroom
            ]
        )
    )

    app.post(`/api/chatroom/kick_user`, 
        carousel(
            [
                middlewares.parseBody,
                Controller.kickUser
            ]
        )
    )

    app.post(`/api/chatroom/revoke_access_token`, 
        carousel(
            [
                middlewares.parseBody,
                Controller.revokeToken
            ]
        )
    )


    app.post(`/api/chatroom/generate_access_tokens`,
        carousel(
            [
                middlewares.parseBody,
                Controller.generateAccessTokens
            ]
        )

    )

}