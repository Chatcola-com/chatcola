import { Container } from "typedi";

import ChatroomManagementService from "../chatroom-management.service";
import MessageService from "../message.service";

const chatroomManagementService = Container.get(ChatroomManagementService);
const messageService = Container.get(MessageService);

export async function kickUser(slug: string, user_name: string) {

    await chatroomManagementService.kickUser(slug, user_name);

    return {
        success: true
    }
}

export async function revokeAccessToken(slug: string, targetToken: string) {
        
    await chatroomManagementService.revokeAccessToken(slug, targetToken);

    return {
        success: true
    }
}

export async function generateAccessTokens(slug: string, amount: number) {

    await chatroomManagementService.generateAccessTokens(slug, amount);

    return {
        success: true
    }
}

export async function remove(slug: string) {

    await Promise.all([
        chatroomManagementService.remove(slug),
        messageService.clearAll(slug)
    ])

    return {
        success: true
    }
}

export async function clearAllMessages(slug: string) {

    const nDeleted = await messageService.clearAll(slug)

    return {
        success: true,
        data: {
            nDeleted
        }
    }
}