/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { TemplatedApp } from "uWebSockets.js";

import { HttpMiddlewares as middlewares } from "karuzela";
import carousel, { validateBody, authenticateForChatroom } from "../middlewares";

import schema from "../schema";
import Controller from "../controllers/auth";

export default (app: TemplatedApp): void => {

    app.post(`/api/auth/chatToken`, 
        carousel(
            [
                middlewares.parseBody,
                validateBody( schema.auth.login ),
                Controller.login 
            ]
        ) 
    );

    app.get(`/api/auth/:slug`, 
        carousel(
            [
                middlewares.parseParams(["slug"]),
                Controller.getAuthType
            ]
        )
    );

    app.post(`/api/auth/leave`, 
        carousel([
            authenticateForChatroom,
            Controller.leave
        ])
    )

    app.post(`/api/auth/admin`, 
        carousel(
            [
                middlewares.parseBody,
                validateBody( schema.auth.adminLogin ),
                Controller.adminLogin
            ]
        )
    );

}

