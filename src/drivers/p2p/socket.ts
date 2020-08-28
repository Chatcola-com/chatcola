import router from "../../application/socket/router";

import { Container } from "typedi";
import { EventEmitter } from "events";

import events from "../../application/events/events";
import { publishToChatroom, TChatroomSocket } from "../../application/socket/activeSockets";

const eventEmitter = Container.get<EventEmitter>("eventEmitter");

export default async function bootstrapChatroomSocketDataChannel(channel: RTCDataChannel) {

    const interfacedChatroomSocket: TChatroomSocket = {
        //@ts-ignore
        locals: channel.locals,
        send (data) {
            channel.send(data)
        },
        isOpen() {
            return channel.readyState === "open";
        },
        close() {
            return channel.close();
        }
    }

    
    try {
        await awaitChannelOpen(channel);
    }
    catch ( error ) {
        console.error("while waiting for rtc channel to open: ", error);
        return;
    }

    eventEmitter.emit(events.NEW_CLIENT_CONNECTED, interfacedChatroomSocket);

    channel.addEventListener("close", () => eventEmitter.emit(events.CLIENT_DISCONNECTED, interfacedChatroomSocket))

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
        else if( interfacedChatroomSocket.isOpen() )
            interfacedChatroomSocket.send(JSON.stringify(result.body));
    }
}

async function awaitChannelOpen(channel: RTCDataChannel) {
    return new Promise( (res, rej) => {

        let timesChecked = 0;

        const interval = setInterval(() => {
            if(channel.readyState === "open") {
                clearInterval(interval);
                return res();
            }
            else if(timesChecked >= 100) {
                clearInterval(interval);
                return rej("Channel didn't open for more than 10 seconds");
            }
        }, 100);
    })
}