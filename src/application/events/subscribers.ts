/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import events from "./events";

import { Container } from "typedi";
import { EventEmitter } from "events";

import MessageService from "../message.service";
import { TMessage } from "../../application/entities/message";
import { TChatroom } from "../../application/entities/chatroom";

import { TKeyValueStore } from "../../types/infrastructure";

import mongoose from "mongoose";

import { activeSockets, publishToChatroom, TChatroomSocket } from "../socket/activeSockets";

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

    emitter.on(events.NEW_CLIENT_CONNECTED, async (socket: TChatroomSocket) => {

        if(!activeSockets[socket.locals.slug])  
            activeSockets[socket.locals.slug] = [];

        activeSockets[socket.locals.slug].push(socket);   

        const active_users = getActiveUsers( socket.locals.slug );
    
        socket.send(JSON.stringify( {
            type: "active_users",
            data: { 
                active_users
            }
        } ))

        socket.send(JSON.stringify({
            type: "whoami",
            data: { 
                name: socket.locals.name
            }
        }))

        publishToChatroom(
            socket.locals.slug,
            JSON.stringify({
                type: "user_joined",
                data: {
                    user_name: socket.locals.name
                }
            })
        )
    })

    emitter.on(events.CLIENT_DISCONNECTED, async (ws: TChatroomSocket) => {
        
        if(!activeSockets[ws.locals.slug])
            return;

        activeSockets[ws.locals.slug] = activeSockets[ws.locals.slug].filter( client => client !== ws );

        const randomSocket = getSocketFromChatroom(ws.locals.slug);

        if(!randomSocket)
            return;

        publishToChatroom(
            ws.locals.slug,
            JSON.stringify( {
                type: "user_left",
                data: {
                    user_name: ws.locals.name
                }
            })
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

        const randomSocket = getSocketFromChatroom(slug);

        if(randomSocket)
            publishToChatroom(
                randomSocket?.locals.slug,    
                JSON.stringify({
                    type: "message",
                    data: {
                        message
                    }
                })
            )

        const ws = activeSockets[slug]?.find( client => client.locals.name === user_name);

        if(!ws)
            return;

        ws.send(JSON.stringify({ type: "kick" }))

        setTimeout(() => ws.close(), 1000);
    });
}

function getSocketFromChatroom(slug: string): TChatroomSocket | null {
    if(activeSockets[slug]?.length > 0)
        return activeSockets[slug][0];

    return null;
}

function getActiveUsers(slug: string): Array<string> {
    const result = activeSockets[slug].map( ws => ws.locals.name )

    return result;
}