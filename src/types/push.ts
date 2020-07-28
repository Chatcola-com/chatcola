/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
export type TPushSubscriber = {
    kind: "web" | "android" | "ios";
    details: string;
    _id: string;
}

import * as zod from "zod";


export const pushMessageSchema = zod.union([
    zod.object({
        type: zod.literal("incomingMessage"),
        data: zod.object({
            _id: zod.string(),
            author: zod.string(),
            content: zod.string(),
            slug: zod.string()
        })
    }),
    zod.object({
        type: zod.literal("youAreBanned"),
        data: zod.object({
            slug: zod.string()
        })
    })
])

export type TPushMessage = zod.infer<typeof pushMessageSchema>;