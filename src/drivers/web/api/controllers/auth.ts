/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { HttpResponse, HttpRequest } from "uWebSockets.js";

import { Container } from "typedi";
import AuthService from "../../../../application/auth.service";
import ChatroomService from "../../../../application/chatroom.service";

const authService = Container.get(AuthService);

const chatroomService = Container.get(ChatroomService);

const login = async (res: HttpResponse, req: HttpRequest) => {

    const token = await authService.login( res.body );

    res.writeStatus(`200 OK`);

    res.end(JSON.stringify({
        success: true,
        data: { token }
    }))
}

const leave = async (res: HttpResponse, req: HttpRequest) => {
    await authService.leave(res.claims.slug, res.claims.name);

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify({
        success: true
    }))
}

const adminLogin = async (res: HttpResponse, req: HttpRequest) => {

    const admin_token = await authService.adminLogin(res.body);

    res.writeStatus(`200 OK`);

    res.end(JSON.stringify({
        success: true,
        data: { admin_token }
    }))
}

const getAuthType = async (res: HttpResponse, req: HttpRequest) => {

    const slug = res.params["slug"];

    const chatroom = await chatroomService.getBasic(slug);

    if(!chatroom) {
        res.writeStatus(`404 Not Found`);
        res.end(JSON.stringify({
            success: false,
            error: "Not found"
        }));

        return;
    }

    const { auth_type } = chatroom;

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify({
        success: true,
        data: {
            auth_type
        }
    }))    
}

export default { 
    login,
    adminLogin,
    getAuthType,
    leave
}
