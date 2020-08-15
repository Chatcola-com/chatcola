import * as zod from "zod";

import Container from "typedi";
import { TLogger } from "../../../types/infrastructure";

import * as resourcesSchema from "../../../application/resources/schema";

import router from "../../../application/resources/router";

const actualStringSchema = zod.string().nonempty();

const Logger = Container.get<TLogger>("logger");

export default function bootstrapRTCDataChannel(channel: RTCDataChannel) {

    channel.onmessage = async (event) => {

        try {
            const message = JSON.parse(event.data);

            const requestId = actualStringSchema.parse(message.requestId);
            const resourcePath = actualStringSchema.parse(message.resourcePath);
            const context = resourcesSchema.requestContext.parse(message.context);

            Logger.info(`Webrtc request ${resourcePath}`)

            const result = await router(
                resourcePath,
                message.body,
                context
            );

            channel.send(JSON.stringify({
                requestId,
                body: result
            }))
        }
        catch ( error ) {

            console.error("while receiving message from p2p channel: ", error, event);

            channel.send(JSON.stringify({
                error
            }))
        }
    }
}