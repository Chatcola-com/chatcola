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
import { 
    RTCPeerConnection as _RTCPeerConnection,
    RTCSessionDescription as _RTCSessionDescription
//@ts-ignore
} from "wrtc";

import { v4 as uuidv4 } from "uuid";

import { Container } from "typedi";
import { TAlligatorWsConnector } from "../../types/infrastructure";
import config from "./config";

import bootstrapRequestResponseDataChannel from "./api";
import bootstrapChatroomSocketDataChannel from "./socket";

import AuthService from "../../application/auth.service";


const peerConnections: {
    [topicId: string]: RTCPeerConnection
} = {};

export default async function bootstrapP2PServer() {

    const alligatorWsConnector = Container.get<TAlligatorWsConnector>("alligatorWsConnector");
    const authService = Container.get(AuthService);

    alligatorWsConnector.subscribe("webrtcoffer", async (messageFromPeer, sendToPeer) => {
        if(messageFromPeer.type !== "webrtcoffer")
            return;

        const pc: RTCPeerConnection = new _RTCPeerConnection({ iceServers: config.iceServers });

        //@ts-ignore
        pc.ondatachannel = async ({ channel }: { channel: RTCDataChannel  }) => {

            if(channel.label === "dummy")
                return;

            //@ts-ignore
            channel.__the_send = channel.send.bind(channel);
            //@ts-ignore
            channel.send = function(message) {
                //@ts-ignore
                chunkMessage(message).forEach(channel.__the_send)
            }

            if(channel.label.split("-")[0] === "chatroomSocket") {
                const chatroomToken = channel.label.substring(15)

                const claims = await authService.validateChatUserToken(chatroomToken!);
                
                //@ts-ignore
                channel.locals = {
                    name: claims.name,
                    slug: claims.slug
                };  

                await awaitForChannelOpen(channel);

                bootstrapChatroomSocketDataChannel(channel);
            }
            else if(channel.label === "requestResponse") {
                bootstrapRequestResponseDataChannel(channel);
                
                await awaitForChannelOpen(channel);
                channel.send(JSON.stringify({ kind: "ACK" }));
            }
        }

        peerConnections[messageFromPeer.topicId] = pc;

        await pc.setRemoteDescription(new _RTCSessionDescription(
            JSON.parse(messageFromPeer.data.webrtcoffer)
        ));

        const answer = await pc.createAnswer();

        pc.onicecandidate = (event) => {
            if(!event.candidate)
                return;
            
            sendToPeer({
                type: "icecandidate",
                data: {
                    icecandidate: JSON.stringify(event.candidate)
                }
            })
        }

        await pc.setLocalDescription(answer);

        sendToPeer({
            type: "webrtcanswer",
            data: {
                webrtcanswer: JSON.stringify(answer)
            }
        })
    });

    alligatorWsConnector.subscribe("icecandidate", (message) => {
        if( message.type !== "icecandidate" )
            return;

        awaitForPeerconnection(message.topicId).then(() => {

            const pc = peerConnections[message.topicId];

            pc.addIceCandidate(JSON.parse(message.data.icecandidate));
        })    
    })
}

async function awaitForPeerconnection(topicId: string) {
    return new Promise( (re, rj) => {
        
        let timesFired = 0;

        const interval = setInterval(() => {

            if(timesFired >= 120) {
                clearInterval(interval);
                rj();
            }

            if(peerConnections[topicId])
                re();
            else 
                timesFired++;

        }, 500);
    })
}

async function awaitForChannelOpen(channel: RTCDataChannel) {
    return new Promise( r => {
        const interval = setInterval(() => {
            if(channel.readyState === "open")
                r(clearInterval(interval));
        }, 50);
    })
}

const MAX_CHUNK_SIZE=1024*15;

function chunkMessage(message: string): string[] {

    /**https://stackoverflow.com/users/763074/justin-warkentin ---> thanks! */
    const numChunks = Math.ceil(message.length / MAX_CHUNK_SIZE)
    const chunks = new Array(numChunks)

    for (let i = 0, o = 0; i < numChunks; ++i, o += MAX_CHUNK_SIZE) {
        chunks[i] = message.substr(o, MAX_CHUNK_SIZE)
    }

    const transactionId = uuidv4();

    const result = chunks.map(chunk => ({
        transactionId,
        chunk,
        isLast: false
    }));

    result[result.length - 1].isLast = true;

    return result.map(chunk => JSON.stringify(chunk));
}
