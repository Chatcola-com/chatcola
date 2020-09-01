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
import { Service, Inject, Container } from "typedi";
import { TFetcher } from "../types/infrastructure";

import { TPushMessage } from "types/push";

//@ts-ignore

import infraConfig from "../infrastructure/config";
import KeyService from "../infrastructure/keys";

@Service()
export default class AlligatorService {

    constructor(
        @Inject("alligatorFetcher") private fetcher: TFetcher,
        @Inject("keyservice") private keyService : KeyService
    ) {}

    async sayHello() {
    
        const THIS_INSTANCE_ADDRESS = Container.get<string>("THIS_INSTANCE_ADDRESS");
    
        const result = await this.fetcher(`/api/chatcolaInstance/hello`, {
            method: "POST",
            body: JSON.stringify({
                myName: THIS_INSTANCE_ADDRESS
            })
        });

        if(!result.success) 
            throw new Error(JSON.stringify(result));
    }

    async sayHelloP2p() {
        
        const THIS_INSTANCE_ADDRESS = Container.get<string>("THIS_INSTANCE_ADDRESS");

        const result = await this.fetcher(`/api/chatcolaInstance/hello`, {
            method: "POST",
            body: JSON.stringify({
                myName: THIS_INSTANCE_ADDRESS,
                publicRSAKey: this.keyService.getPublicKey()
            })
        });
    }
    
    async putChatroomCard({slug, valid_until}: { slug: string; valid_until: number }) {

        const result = await this.fetcher(`/api/chatroomCard`, {
            method: "POST",
            body: JSON.stringify({
                slug,
                validUntil: valid_until,
                isP2p: infraConfig.driver === "webrtc"
            })
        });

        if(!result.success) 
            throw new Error(JSON.stringify(result));
    }

    async sendPushNotification(subscribersIds: string[], message: TPushMessage) {
        await this.fetcher(`/api/push/bulkNotify`, {
            method: "POST",
            body: JSON.stringify({
                subscribersIds,
                message
            })
        })
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