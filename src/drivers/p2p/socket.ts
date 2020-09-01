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