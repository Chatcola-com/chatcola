/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { 
    RTCPeerConnection as _RTCPeerConnection,
    RTCSessionDescription as _RTCSessionDescription
//@ts-ignore
} from "wrtc";

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

    alligatorWsConnector.subscribe("webrtcoffer", async (message, send) => {
        if(message.type !== "webrtcoffer")
            return;

        const pc: RTCPeerConnection = new _RTCPeerConnection({ iceServers: config.iceServers });

        pc.ondatachannel = async ({ channel }) => {

            if(channel.label === "dummy")
                return;
            else if(channel.label.split("-")[0] === "chatroomSocket") {
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

        peerConnections[message.topicId] = pc;

        await pc.setRemoteDescription(new _RTCSessionDescription(
            JSON.parse(message.data.webrtcoffer)
        ));

        const answer = await pc.createAnswer();

        pc.onicecandidate = (event) => {
            if(!event.candidate)
                return;
            
            send({
                type: "icecandidate",
                data: {
                    icecandidate: JSON.stringify(event.candidate)
                }
            })
        }

        await pc.setLocalDescription(answer);

        send({
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