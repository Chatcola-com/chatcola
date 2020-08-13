import { Container } from "typedi";
import ChatroomService from "../../../../application/chatroom.service";
import AlligatorService from "../../../../application/alligator.service";

import { TWebrtcController } from "./index";

const chatroomService = Container.get(ChatroomService);
const alligatorService = Container.get(AlligatorService);

const controllers: {
    [key: string]: TWebrtcController
} = {
    async startChatroom(request, reply) {
        
        if(request.type !== "startChatroom") 
            return reply({
                success: false
            })
        

        const chatroom = await chatroomService.new(request.body);

        const { slug, valid_until } = chatroom;

        await alligatorService.putChatroomCard({ slug, valid_until });

        reply({
            success: true,
            data: {
                chatroom
            }
        })
    }
}

export default controllers;