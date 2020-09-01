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
import * as zod from "zod";

export const createChatroom = zod.object({
    name: zod.string().nonempty(),
    valid_until: zod.number(),
    max_users: zod.number().min(2).max(100),
    access_tokens_amount: zod.number().nonnegative().max(100),
    auth_type: zod.enum(["none", "access_tokens"])
})

export const justSlug = zod.object({
    slug: zod.string().nonempty()
})

export const kickUser = zod.object({
    user_name: zod.string().nonempty()
})

export const revokeToken = zod.object({
    targetToken: zod.string()
})

export const generateAccessTokens = zod.object({
    amount: zod.number().min(1).max(100)
})

export const pushAndChatroomTokens = zod.object({
    pushSubscriptionToken: zod.string().nonempty(),
    chatroomToken: zod.string().nonempty()
})

export const enterChatroom = zod.object({
    slug: zod.string().nonempty(),
    name: zod.string().nonempty(),
    access_token: zod.string().optional(),
    admin_token: zod.string().nonempty().optional()
})

export const enterManagingChatroom = zod.object({
    admin_password: zod.string().nonempty(),
    admin_slug: zod.string().nonempty(),
    slug: zod.string().nonempty()
})

export const requestContext = zod.object({
    token: zod.string().nonempty().optional().nullable()
})

export type TRequestContext = zod.infer< typeof requestContext >;