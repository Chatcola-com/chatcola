/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { HttpResponse, HttpRequest } from "uWebSockets.js";

import * as resourceSchema from "../../../../application/resourcesSchema";

import * as auth from "../../../../application/use-cases/auth";

const login = async (res: HttpResponse, req: HttpRequest) => {

    const details = resourceSchema.enterChatroom.parse(res.body);

    const result = await auth.enterChatroom(details);

    res.writeStatus(`200 OK`);

    res.end(JSON.stringify(result))
}

const adminLogin = async (res: HttpResponse, req: HttpRequest) => {

    const details = resourceSchema.enterManagingChatroom.parse(res.body);
    const result = await auth.enterManagingChatroom(details);

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify(result))
}

const getAuthType = async (res: HttpResponse, req: HttpRequest) => {

    const { slug } = resourceSchema.justSlug.parse(res.body);

    const result = await auth.getAuthType(slug);

    res.writeStatus(`200 OK`);
    res.end(JSON.stringify(result))    
}

export default { 
    login,
    adminLogin,
    getAuthType
}
