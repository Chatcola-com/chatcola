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
import { TAlligatorWsConnector } from "types/infrastructure";
import config from "./config";
import bootstrapRTCDataChannel from "./api";

const alligatorWsConnector = Container.get<TAlligatorWsConnector>("alligatorWsConnector");


const peerConnections: {
    [topicId: string]: RTCPeerConnection
} = {};

const dataChannels: {
    [topicId: string]: RTCDataChannel
} = {};

export default async function bootstrapP2PServer() {

    alligatorWsConnector.subscribe("webrtcoffer", async (message, send) => {
        
        if(message.type !== "webrtcoffer")
            return;

        const pc: RTCPeerConnection = new _RTCPeerConnection({
            iceServers: config.iceServers
        });

        pc.ondatachannel = ({ channel }) => {
            channel.onopen = () => {
                dataChannels[message.topicId] = channel;
                bootstrapRTCDataChannel(channel);
            }

            channel.onclose = () => {
                delete dataChannels[message.topicId];
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
