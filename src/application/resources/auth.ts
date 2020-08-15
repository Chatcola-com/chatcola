import { Container } from "typedi";

import * as zod from "zod";

import * as resourcesSchema from "./schema";
import AuthService from "../auth.service";
import ChatroomService from "../chatroom.service";

import { AppError } from "../../infrastructure/utils";


const authService = Container.get(AuthService);
const chatroomService = Container.get(ChatroomService);

export async function enterChatroom(details: zod.infer< typeof resourcesSchema.enterChatroom >) {

    try {
        const token = await authService.login( details );

        return {
            success: true,
            data: { token }
        };
    } 
    catch ( error ) {
        if( error instanceof AppError ) {
            return {
                success: false,
                error: error.message
            }
        }
        else
            throw error;
    }
}

export async function enterManagingChatroom(details: zod.infer< typeof resourcesSchema.enterManagingChatroom >) {
    try {
        const admin_token = await authService.adminLogin( details );

        return {
            success: true,
            data: { admin_token }
        };
    } 
    catch ( error ) {
        if( error instanceof AppError ) {
            return {
                success: false,
                error: error.message
            }
        }
        else
            throw error;
    }
}

export async function getAuthType(slug: string) {

    const chatroom = await chatroomService.getBasic(slug);

    if(!chatroom) {
        return{
            success: false,
            error: "Not found"
        }
    }

    return {
        success: true,
        data: {
            auth_type: chatroom.auth_type
        }
    }
}