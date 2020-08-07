//@ts-ignore
import { RTCPeerConnection } from "wrtc";

import adapter from "webrtc-adapter";

export default async function bootstrapP2PServer() {

    const pc = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.stunprotocol.org" },
        ]
    })

    const offer = await pc.createOffer();

    console.log(offer);
}