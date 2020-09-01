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
                error: error.message,
                data: {}
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
                error: error.message,
                data: {}
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
            error: "Not found",
            data: {}
        }
    }

    return {
        success: true,
        data: {
            auth_type: chatroom.auth_type
        }
    }
}