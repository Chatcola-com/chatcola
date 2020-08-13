import * as zod from "zod";

export const messageFromPeerSchema = zod.union([
    zod.object({
        type: zod.literal("startChatroom"), 
        body: zod.object({
            name: zod.string(),
            valid_until: zod.number(),
            max_users: zod.number().min(2).max(100),
            access_tokens_amount: zod.number().nonnegative().max(100),
            auth_type: zod.enum(["none", "access_tokens"])
        })
    }),
    zod.object({
        type: zod.literal("getChatroom"),
        body: zod.object({
            
        })
    })
]);

export type TMessageFromPeer = zod.infer< typeof messageFromPeerSchema >;