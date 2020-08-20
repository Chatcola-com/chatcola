import router from "../../application/socket/router";

import { Container } from "typedi";
import { EventEmitter } from "events";

import events from "../../application/events/events";
import { publishToChatroom } from "../../application/socket/activeSockets";

const eventEmitter = Container.get<EventEmitter>("eventEmitter");

export default function bootstrapChatroomSocketDataChannel(channel: RTCDataChannel) {

    setTimeout(() => {
        eventEmitter.emit(events.NEW_CLIENT_CONNECTED, channel);
    }, 1500);

    channel.onclose = () => eventEmitter.emit(events.CLIENT_DISCONNECTED, channel);

    channel.onmessage = (e) => {
        const message = JSON.parse(e.data.toString());

        const result = router(
            message,
            //@ts-ignore
            channel.locals
        )

        if(!result)
            return;

        //@ts-ignore
        const slug = channel?.locals?.slug;

        if(result.broadcast)
            publishToChatroom(slug, JSON.stringify(result.body))
        else
            channel.send(JSON.stringify(result.body));
    }
}