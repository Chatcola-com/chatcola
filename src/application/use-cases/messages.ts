import { Container } from "typedi";

import * as zod from "zod";

import * as resourcesSchema from "../resourcesSchema";
import MessageService from "../message.service";
import { catchUnauthorized } from "./utils";
import AuthService from "../auth.service";

const messageService = Container.get(MessageService);
const authService = Container.get(AuthService);

export async function getMessages(chatUserToken: string) {

    
    return catchUnauthorized(async () => {
        
        const claims = await authService.validateChatUserToken(chatUserToken);

        const messages = await messageService.get(claims.slug);

        return {
            success: true,
            data: messages
        }
    });

}