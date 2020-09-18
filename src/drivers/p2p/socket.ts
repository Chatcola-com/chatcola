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

import ActiveSocketsManager, { TChatroomSocket } from "../../application/socket/activeSockets";

const socketManager = Container.get(ActiveSocketsManager);

export default async function bootstrapChatroomSocketDataChannel(channel: RTCDataChannel) {
    
    try {
        await awaitChannelOpen(channel);
    }
    catch ( error ) {
        console.error("while waiting for rtc channel to open: ", error);
        return;
    }

    const interfacedChatroomSocket: TChatroomSocket = {
        //@ts-ignore
        locals: channel.locals,
        send (data) {
            channel.send(JSON.stringify(data))
        },
        isOpen() {
            return channel.readyState === "open";
        },
        close() {
            return channel.close();
        }
    }

    channel.send(JSON.stringify({
        kind: "ACK",
        data: {}
    }))

    socketManager.socketJoined(interfacedChatroomSocket);

    channel.addEventListener(
        "close", 
        () => socketManager.socketLeft(interfacedChatroomSocket)
    );

    channel.onmessage = (e) => {

        receiveChannelMessage(e.data.toString(), completeMessage => {
            const message = JSON.parse(completeMessage);

            router(
                message,
                //@ts-ignore
                channel.locals
            )
        })
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

const enqueuedMessages: {
    [transactionId: string]: string;
} = {};


function receiveChannelMessage(rawMessage: string, resolve: (m: string) => any) {
    const message = JSON.parse(rawMessage);

    if(!enqueuedMessages[message.transactionId])
        enqueuedMessages[message.transactionId] = "";

    enqueuedMessages[message.transactionId] += message.chunk;

    if(message.isLast) {
        resolve(enqueuedMessages[message.transactionId]);
        delete enqueuedMessages[message.transacionId];
    }
}