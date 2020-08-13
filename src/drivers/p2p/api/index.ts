import * as zod from "zod";
import { messageFromPeerSchema } from "../../../types/chatroom";

import ChatroomController from "./controllers/chatroom";

const requestIdSchema = zod.string().nonempty();

export default function bootstrapRTCDataChannel(channel: RTCDataChannel) {

    channel.onmessage = (event) => {

        try {
            const message = JSON.parse(event.data);

            const requestId = requestIdSchema.parse(message.requestId);
            const request = messageFromPeerSchema.parse(message.body);
    
            function reply(body: any) {
                channel.send(JSON.stringify({
                    ...body,
                    requestId
                }))
            }
            
            switch(request.type) {
                case "startChatroom": {
                    return ChatroomController.startChatroom(request, reply)
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