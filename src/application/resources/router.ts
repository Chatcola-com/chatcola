import { Container } from "typedi";

import { TRequestContext } from "../resourcesSchema";
import { ITokenClaims } from "../../types/auth";

import AuthService from "../auth.service";

import * as chatroom from "./chatroom";
import * as chatroomManagement from "./chatroom-management";
import * as messages from "./messages";
import * as auth from "./auth";

import * as resourcesSchema from "../resourcesSchema";
import { AppError } from "../../infrastructure/utils";
import { IKeyService } from "../../types/infrastructure";

const keyService = Container.get<IKeyService>("keyservice");
const authService = Container.get(AuthService);

export default async function wrappedResourceRouter(resourcePath: string, body: {[key: string]: any}, context: TRequestContext) {

    try {
        return await resourceRouter(resourcePath, body, context);
    } catch ( error ) {
        
        if( 
            error instanceof AppError  &&  
            !error.shouldReport 
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

async function resourceRouter(resourcePath: string, body: {[key: string]: any}, context: TRequestContext) {
    
    let claims: ITokenClaims | undefined;

    if(context.adminToken)
        claims = await authService.validateChatAdminToken(context.adminToken);
    else if(context.chatroomToken)
        claims = await authService.validateChatUserToken(context.chatroomToken);

    const hasToken = Boolean(claims?.slug);
    const isChatAdmin = Boolean(hasToken && claims?.type === "admin");

    function throwIfNotAdmin() {
        if( !isChatAdmin )
            throw new AppError(`Unauthorized: no admin token at ${resourcePath}`);
    }

    function throwIfNoToken() {
        if( !hasToken ) 
            throw new AppError(`Unauthorized: no token at ${resourcePath}`);
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
                publicRSAKey: keyService.getPublicKey()
            }
        }
        default: {
            return {
                success: false,
                error: "404 Route not found"
            }
        }
    }
}