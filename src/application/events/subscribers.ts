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
import events from "./events";

import { Container } from "typedi";
import { EventEmitter } from "events";

import MessageService from "../message.service";
import { TMessage } from "../../application/entities/message";
import { TChatroom } from "../../application/entities/chatroom";

import { TKeyValueStore } from "../../types/infrastructure";

import mongoose from "mongoose";

import * as activeSockets from "../socket/activeSockets";

const emitter = Container.get<EventEmitter>("eventEmitter");

const messageService = Container.get(MessageService);

const keyValueStore = Container.get<TKeyValueStore>("keyValueStore");

import * as sendPushNotifications from "../resources/sendPushNotifications";

export default () => {

    emitter.on(events.NEW_CHATROOM, async (details: TChatroom) => {
        let chatroomCount = keyValueStore.getItem("CHATROOM_COUNT");
        if((typeof chatroomCount) !== "number")
            chatroomCount = 0;

        keyValueStore.setItem("CHATROOM_COUNT", chatroomCount + 1);
    });

    emitter.on(events.NEW_MESSAGE, async (message: TMessage) => {
        messageService.new(message);

        sendPushNotifications.aboutIncomingMessage(message.slug, message);
    });

    emitter.on(events.NEW_CLIENT_CONNECTED, async (socket: activeSockets.TChatroomSocket) => {

        activeSockets.addSocket(socket);

        const active_users = 
            activeSockets.getChatroomSockets(socket.locals.slug).map(s => s.locals.name);
    
        socket.send( {
            type: "active_users",
            data: { 
                active_users
            }
        });

        socket.send({
            type: "whoami",
            data: { 
                name: socket.locals.name
            }
        });

        activeSockets.publishToChatroom(
            socket.locals.slug,
            {
                type: "user_joined",
                data: {
                    user_name: socket.locals.name
                }
            }
        )
    })

    emitter.on(events.CLIENT_DISCONNECTED, async (socket: activeSockets.TChatroomSocket) => {
        
        activeSockets.removeSocket(socket);

        activeSockets.publishToChatroom(
            socket.locals.slug,
            {
                type: "user_left",
                data: {
                    user_name: socket.locals.name
                }
            }
        )
    })

    emitter.on(events.USER_KICKED_OUT, async ({ slug, user_name }) => {       
        const message = {
            author: `Server`,
            content: `${user_name} has been kicked out. Bye! 🚀🚀🚀`,
            _id: new mongoose.Types.ObjectId(),
            slug
        }

        emitter.emit(events.NEW_MESSAGE, message);


        activeSockets.publishToChatroom(
            slug,    
            {
                type: "message",
                data: {
                    message
                }
            }
        );

        const socket = activeSockets.getUserFromChatroom(slug, user_name);

        if(!socket)
            return;

        socket.send({ type: "kick", data: {} })

        setTimeout(() => socket.close(), 1000);
    });
}