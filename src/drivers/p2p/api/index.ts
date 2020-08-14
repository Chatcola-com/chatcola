import * as zod from "zod";

import ChatroomController from "./controllers/chatroom";

const requestIdSchema = zod.string().nonempty();
const resourcePathSchema = zod.enum([
    "startChatroom",

])

export default function bootstrapRTCDataChannel(channel: RTCDataChannel) {

    channel.onmessage = (event) => {

        try {
            const message = JSON.parse(event.data);

            const requestId = requestIdSchema.parse(message.requestId);
            const resourcePath = resourcePathSchema.parse(message.resourcePath);

            function reply(body: any) {
                channel.send(JSON.stringify({
                    requestId,
                    body
                }))
            }
            
            switch(resourcePath) {
                case "startChatroom": {
                    return ChatroomController.startChatroom(message.body, message.context, reply)
                };
            }
        }
        catch ( error ) {

            console.error("while receiving message from p2p channel: ", error, event);

            channel.send(JSON.stringify({
                error
            }))
        }
    }
}