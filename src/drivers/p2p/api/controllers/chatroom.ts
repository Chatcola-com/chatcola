import { Container } from "typedi";
import ChatroomService from "../../../../application/chatroom.service";
import AlligatorService from "../../../../application/alligator.service";

import { TWebrtcController } from "./index";
import * as resourcesSchema from "../../../../application/resources/schema";

const chatroomService = Container.get(ChatroomService);
const alligatorService = Container.get(AlligatorService);

const controllers: {
    [key: string]: TWebrtcController
} = {
    async startChatroom(_body, reply) {

        const body = resourcesSchema.createChatroom.parse(_body);               

        const chatroom = await chatroomService.new(body);

        const { slug, valid_until } = chatroom;

        await alligatorService.putChatroomCard({ slug, valid_until });

        reply({
            success: true,
            data: {
                chatroom
            }
        });
    }
}

export default controllers;