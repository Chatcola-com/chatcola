/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { TemplatedApp } from "uWebSockets.js";

import { HttpMiddlewares as middlewares } from "karuzela";
import carousel from "../middlewares";


import Controller from "../controllers/chatroom";

export default (app: TemplatedApp): void => {
  
    app.post(`/api/chatroom`, 
        carousel(
            [
                middlewares.parseBody,
                Controller.startNew
            ]
        ) 
    );

    app.post(`/api/messages`,
        carousel(
            [
                Controller.getMessages
            ]
        )
    )

    app.get(`/api/chatroom`, 
        carousel(
            [ 
                Controller.getBasic
            ]
        ) 
    );

    app.get(`/api/chatroom/detailed`,
        carousel(
            [ 
                Controller.getDetailed
            ]
        ) 
    );

    app.post(`/api/chatroom/leave`, 
        carousel([
            Controller.leave
        ])
    );

    app.post(`/api/chatroom/clear_my_messages`, 
        carousel([
            Controller.clearMyMessages
        ])
    );

    app.post(`/api/chatroom/pushSubscribe`, carousel([
        middlewares.parseBody,
        Controller.pushSubscribeToChatroom
    ]));
}
