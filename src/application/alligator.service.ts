/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { Service, Inject, Container } from "typedi";
import { TFetcher } from "../types/infrastructure";

import { TPushMessage } from "types/push";

//@ts-ignore
import { RTCPeerConnection } from "wrtc";

import infraConfig from "../infrastructure/config";

const THIS_INSTANCE_ADDRESS = Container.get<string>("THIS_INSTANCE_ADDRESS");

@Service()
export default class AlligatorService {

    constructor(
        @Inject("alligatorFetcher") private fetcher: TFetcher
    ) {}

    async sayHello() {
        const result = await this.fetcher(`/api/chatcolaInstance/hello`, {
            method: "POST",
            body: JSON.stringify({
                myName: THIS_INSTANCE_ADDRESS
            })
        });

        if(!result.success) 
            throw new Error(JSON.stringify(result));
    }

    async sayHelloP2p(webrtcOffer: RTCSessionDescriptionInit, iceCandidates: RTCIceCandidate[]): Promise<{ 
        iceCandidates: RTCIceCandidate[], 
        webrtcAnswer: RTCSessionDescriptionInit 
    }> {
    
        const result = await this.fetcher(`/api/chatcolaInstance/hellop2p`, {
            method: "POST",
            body: JSON.stringify({
                myName: THIS_INSTANCE_ADDRESS,
                webrtcOffer,
                iceCandidates
            })
        });

        return result.data;
    }
    
    async putChatroomCard({slug, valid_until}: { slug: string; valid_until: number }) {

        const result = await this.fetcher(`/api/chatroomCard/`, {
            method: "POST",
            body: JSON.stringify({
                slug,
                validUntil: valid_until
            })
        });

        if(!result.success) 
            throw new Error(JSON.stringify(result));
    }

    async sendPushNotification(subscribersIds: string[], message: TPushMessage) {
        const result = await this.fetcher(`/api/push/bulkNotify`, {
            method: "POST",
            body: JSON.stringify({
                subscribersIds,
                message
            })
        })

        console.log(result);
    }
    
    async validatePushSubscriptionToken(pushSubscriptionToken: string): Promise<string> {
        const result = await this.fetcher(`/api/push/isSubscriptionValid`, {
            method: "POST",
            body: JSON.stringify({
                pushSubscriptionToken
            })
        });

        if(!result.success || !result.data)
            throw new Error(JSON.stringify(result));

        const { isItValid, subscriptionId } = result.data;

        if(isItValid && subscriptionId)
            return subscriptionId;
        else
            throw new Error("Unauthorized");
    }
}