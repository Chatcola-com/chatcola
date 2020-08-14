import { Container } from "typedi";


import ChatroomManagementService from "../chatroom-management.service";
import AuthService from "../auth.service";
import MessageService from "../message.service";

import { catchUnauthorized } from "./utils";

const chatroomManagementService = Container.get(ChatroomManagementService);
const authService = Container.get(AuthService);
const messageService = Container.get(MessageService);

export async function kickUser(chatAdminToken: string, user_name: string) {

    return catchUnauthorized(async () => {

        const claims = await authService.validateChatAdminToken(chatAdminToken);

        await chatroomManagementService.kickUser(claims.slug, user_name);

        return {
            success: true
        }
    });
}

export async function revokeAccessToken(chatAdminToken: string, targetToken: string) {

    return catchUnauthorized(async () => {
        
        const claims = await authService.validateChatAdminToken(chatAdminToken);

        await chatroomManagementService.revokeAccessToken(claims.slug, targetToken);

        return {
            success: true
        }
    })
}

export async function generateAccessTokens(chatAdminToken: string, amount: number) {

    return catchUnauthorized(async () => {

        const claims = await authService.validateChatAdminToken(chatAdminToken);
        
        await chatroomManagementService.generateAccessTokens(claims.slug, amount);

        return {
            success: true
        }
    });
}

export async function remove(chatAdminToken: string) {
    return catchUnauthorized(async () => {
        const claims = await authService.validateChatAdminToken(chatAdminToken);

        await Promise.all([
            chatroomManagementService.remove(claims.slug),
            messageService.clearAll(claims.slug)
        ])

        return {
            success: true
        }
    })
}

export async function clearAllMessages(chatAdminToken: string) {
    return catchUnauthorized(async () => {
        const claims = await authService.validateChatAdminToken(chatAdminToken);

        const nDeleted = await messageService.clearAll(claims.slug)

        return {
            success: true,
            data: {
                nDeleted
            }
        }
    })
}