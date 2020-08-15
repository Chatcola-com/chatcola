import * as zod from "zod";

export default zod.union([
    zod.object({
        type: zod.literal("start_typing"),
        data: zod.object({})
    }),
    zod.object({
        type: zod.literal("stop_typing"),
        data: zod.object({})
    }),
    zod.object({
        type: zod.literal("whoami"),
        data: zod.object({})
    }),
    zod.object({
        type: zod.literal("ping"),
        data: zod.object({})
    }),
    zod.object({
        type: zod.literal("message"),
        data: zod.object({
            content: zod.string().nonempty()
        })
    })
]);

export type TSocketResponse = {
    broadcast?: boolean;
    body: {
        type: string;
        data: {
            [key: string]: any;
        }
    }
}