/*
|    For alternative licensing arrangements contact us at freedom@chatcola.com
|--------------------------------------------------------------------------------  
|    This file is part of chatcola.com server
|    Copyright (C) 2020 Antoni Papiewski & Milan Kazarka
|
|    This program is free software: you can redistribute it and/or modify
|    it under the terms of the GNU Affero General Public License as published by
|    the Free Software Foundation, either version 3 of the License, or
|    (at your option) any later version.
|
|    This program is distributed in the hope that it will be useful,
|    but WITHOUT ANY WARRANTY; without even the implied warranty of
|    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
|    GNU Affero General Public License for more details.
|
|    You should have received a copy of the GNU Affero General Public License
|    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import { Container } from "typedi";

import { TRequestContext } from "./schema";
import { ITokenClaims } from "../../types/auth";

import AuthService from "../auth.service";

import * as chatroom from "./chatroom";
import * as chatroomManagement from "./chatroom-management";
import * as messages from "./messages";
import * as auth from "./auth";

import * as resourcesSchema from "./schema";
import { AppError } from "../../infrastructure/utils";
import { IKeyService } from "../../types/infrastructure";
import { ZodError } from "zod";

import licenses from "../../third-party-licenses.json";

const keyService = Container.get<IKeyService>("keyservice");
const authService = Container.get(AuthService);

export default async function wrappedResourceRouter(resourcePath: string, body: {[key: string]: any}, context: TRequestContext) {

    try {
        return await resourceRouter(resourcePath, body, context);
    } catch ( error ) {
        
        if( 
            error instanceof ZodError ||
            (
                error instanceof AppError  &&  
                !error.shouldReport 
            )
        ) {
            return {
                success: false,
                error: error.message,
                data: {}
            }
        }
        else 
            throw error;
    }
}

async function resourceRouter(resourcePath: string, body: {[key: string]: any}, context: TRequestContext): Promise<{
    success: boolean,
    data: any,
    error?: string
}> {
    
    let claims: ITokenClaims | undefined;

    if(
        context.token &&
        (typeof context.token) === "string" &&
        !(["null", "undefined", ""].includes(context.token))
    )
        claims = await authService.validateChatToken(context.token);

    const hasToken = Boolean(claims?.slug);
    const isChatAdmin = Boolean(hasToken && claims?.type === "admin");

    function throwIfNotAdmin() {
        if( !isChatAdmin )
            throw new AppError(`Unauthorized: no admin token at ${resourcePath}`);
    }

    function throwIfNoToken() {
        if( !hasToken ) 
            throw new AppError(`Unauthorized: no token (user or admin) at ${resourcePath}`);
    }

    function throwIfNotUser() {
        if( !hasToken || claims?.type !== "user" )
            throw new AppError(`Unauthorized: no user token at ${resourcePath}`);
    }

    switch(resourcePath) {
        case "/api/chatroom/create": {

            const details = resourcesSchema.createChatroom.parse(body);

            return await chatroom.create(details);
        }; 
        case "/api/messages": {
            
            throwIfNoToken();

            return await messages.getMessages(claims!.slug)
        };
        case "/api/chatroom/basic": {
            
            throwIfNoToken();

            return await chatroom.getBasic(claims!.slug)
        };
        case "/api/chatroom/detailed": {

            throwIfNotAdmin();

            return await chatroom.getDetailed(claims!.slug);
        };
        case "/api/chatroom/leave": {
            throwIfNotUser();

            //@ts-ignore
            return await chatroom.leave(claims?.slug, claims?.name)
        };
        case "/api/chatroom/clear_my_messages": {
            throwIfNotUser();

            //@ts-ignore
            return await chatroom.clearMyMessages(claims?.slug, claims?.name);
        };
        case "/api/chatroom/pushSubscribe": {
            
            const tokens = resourcesSchema.pushAndChatroomTokens.parse(body);

            return await chatroom.addSubscriptionToUser(
                tokens.chatroomToken,
                tokens.pushSubscriptionToken
            )
        }; 
        case "/api/auth/chatToken": {
            const details = resourcesSchema.enterChatroom.parse(body);

            return await auth.enterChatroom(details);
        };
        case "/api/auth/type": {
            const { slug } = resourcesSchema.justSlug.parse(body);

            return await auth.getAuthType(slug);
        };
        case "/api/auth/admin": {
            const details = resourcesSchema.enterManagingChatroom.parse(body);

            return await auth.enterManagingChatroom(details);
        };
        case "/api/chatroom/clear_messages": {
            throwIfNotAdmin();

            return await chatroomManagement.clearAllMessages(claims!.slug);
        };
        case "/api/chatroom/delete": {
            throwIfNotAdmin();

            return await chatroomManagement.remove(claims!.slug);
        };
        case "/api/chatroom/kick_user": {
            throwIfNotAdmin();

            const { user_name } = resourcesSchema.kickUser.parse(body);

            return await chatroomManagement.kickUser(claims!.slug, user_name)
        };
        case "/api/chatroom/revoke_access_token": {
            throwIfNotAdmin();

            const { targetToken } = resourcesSchema.revokeToken.parse(body);

            return await chatroomManagement.revokeAccessToken(
                claims!.slug,
                targetToken
            )
        };
        case "/api/chatroom/generate_access_tokens": {
            throwIfNotAdmin();

            const { amount } = resourcesSchema.generateAccessTokens.parse(body);

            return await chatroomManagement.generateAccessTokens(
                claims!.slug,
                amount
            );
        };
        case "/api/publicRSAKey": {
            return {
                success: true,
                data: {
                    publicRSAKey: keyService.getPublicKey()
                }
            }
        }
        case "/api/licenses": {

            return {
                success: true,
                data: {
                    licenses
                }
            }
        };
        case "/api/source": {

            return {
                success: true,
                data: {
                    codeRepository: "https://github.com/chatcola-com/chatcola",
                }
            }
        };
        default: {
            return {
                success: false,
                data: {},
                error: "404 Route not found"
            }
        }
    }
}