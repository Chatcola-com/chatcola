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
import * as zod from "zod";

import Container from "typedi";
import { TLogger } from "../../types/infrastructure";

import * as resourcesSchema from "../../application/resources/schema";

import router from "../../application/resources/router";

const actualStringSchema = zod.string().nonempty();

const Logger = Container.get<TLogger>("logger");

export default function bootstrapRequestResponseDataChannel(channel: RTCDataChannel) {

    channel.onmessage = e => receiveChannelMessage(
        e.data.toString(), 
        async (completeMessage) => {

            try {
                const message = JSON.parse(completeMessage);
    
                const requestId = actualStringSchema.parse(message.requestId);
                const resourcePath = actualStringSchema.parse(message.resourcePath);
                const context = resourcesSchema.requestContext.parse(message.context);
    
                const result = await router(
                    resourcePath,
                    message.body,
                    context
                );
            
                Logger.info(`Webrtc request ${resourcePath} -> ${
                    result.success ? `success` : `failed: ${result.error}`
                }`)
            
                channel.send(JSON.stringify({
                    requestId: requestId,
                    body: result
                }))
            }
            catch ( error ) {
    
                console.error("while receiving message from p2p channel: ", error, completeMessage);
    
                channel.send(JSON.stringify({
                    error
                }))
            }
        }    
    )
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