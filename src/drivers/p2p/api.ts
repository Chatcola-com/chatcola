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

    channel.onmessage = async (event) => {

        try {
            const message = JSON.parse(event.data);

            const requestId = actualStringSchema.parse(message.requestId);
            const resourcePath = actualStringSchema.parse(message.resourcePath);
            const context = resourcesSchema.requestContext.parse(message.context);

            if(resourcePath.startsWith("/attachment")) {
                await handleFileRequest({
                    requestId,
                    resourcePath,
                    context
                }, channel);
            }
            else if(resourcePath.startsWith("/api")) {
                await handleResourceRequest({
                    requestId,
                    resourcePath,
                    context,
                    body: message.body
                }, channel);
            }
        }
        catch ( error ) {

            console.error("while receiving message from p2p channel: ", error, event);

            channel.send(JSON.stringify({
                error
            }))
        }
    }
}

async function handleResourceRequest(details: {
    resourcePath: string;
    requestId: string;
    context: resourcesSchema.TRequestContext;
    body: {[key: string]: any};
}, channel: RTCDataChannel) {


    const result = await router(
        details.resourcePath,
        details.body,
        details.context
    );

    Logger.info(`Webrtc request ${details.resourcePath} -> ${
        result.success ? `success` : `failed: ${result.error}`
    }`)

    channel.send(JSON.stringify({
        requestId: details.requestId,
        body: result
    }))
}

async function handleFileRequest(details: {
    context: resourcesSchema.TRequestContext;
    resourcePath: string;
    requestId: string;
}, channel: RTCDataChannel) {

    
}