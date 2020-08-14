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
    chatroomToken: zod.string().nonempty().optional(),
    adminToken: zod.string().nonempty().optional()
})

export type TRequestContext = zod.infer< typeof requestContext >;