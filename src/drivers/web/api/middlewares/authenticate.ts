/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { HttpRequest, HttpResponse } from "uWebSockets.js";

import { Container } from "typedi";
import AuthService from "../../../../application/auth.service";

import { AppError } from "../../../../infrastructure/utils";

const authService = Container.get(AuthService);

export const authenticateForChatroom = async (res: HttpResponse, req: HttpRequest): Promise<any> => {

    const token = res.headers[`Authorization`].split(" ").pop();

    if(!token)
        throw new AppError(`Unauthorized`);

    const claims = await authService.validateChatToken( token );

    res.claims = claims;
}

export const ensureIsAdmin = async (res: HttpResponse, req: HttpRequest): Promise<any> => {
    if(res.claims.type !== "admin")
        throw new AppError("Unauthorized");
}
