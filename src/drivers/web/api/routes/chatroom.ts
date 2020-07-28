/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { TemplatedApp } from "uWebSockets.js";

import { HttpMiddlewares as middlewares } from "karuzela";
import carousel, { validateBody, authenticateForChatroom, ensureIsAdmin } from "../middlewares";

import schema from "../schema";

import Controller from "../controllers/chatroom";

export default (app: TemplatedApp): void => {
  
    app.post(`/api/chatroom`, 
        carousel(
            [
                middlewares.parseBody,
                validateBody( schema.chatroom.create ),
                Controller.startNew
            ]
        ) 
    );

    app.post(`/api/messages`,
        carousel(
            [
                authenticateForChatroom,
                Controller.getMessages
            ]
        )
    )

    app.get(`/api/chatroom`, 
        carousel(
            [ 
                authenticateForChatroom,
                Controller.getBasic
            ]
        ) 
    );

    app.get(`/api/chatroom/detailed`,
        carousel(
            [ 
                authenticateForChatroom,
                ensureIsAdmin,
                Controller.getDetailed
            ]
        ) 
    );

    app.post(`/api/chatroom/leave`, 
        carousel([
            authenticateForChatroom,
            Controller.leave
        ])
    );

    app.post(`/api/chatroom/clear_my_messages`, 
        carousel([
            authenticateForChatroom,
            Controller.clearMyMessages
        ])
    );

    app.post(`/api/chatroom/pushSubscribe`, carousel([
        middlewares.parseBody,
        validateBody(schema.push.subscribeToChatroom),
        Controller.pushSubscribeToChatroom
    ]));
}
