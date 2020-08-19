/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { EventEmitter } from "events";

import events from "./events";
import mongoose from "mongoose";

import { activeSockets, publishToChatroom, TChatroomSocket } from "../socket/activeSockets";
    
export default ( emitter: EventEmitter ) => {

    console.log(emitter)

    emitter.on(events.NEW_CLIENT_CONNECTED, async (ws: TChatroomSocket) => {

        console.log("EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEeees")

        if(!activeSockets[ws.locals.slug])  
            activeSockets[ws.locals.slug] = [];

        activeSockets[ws.locals.slug].push(ws);   

        const active_users = getActiveUsers( ws.locals.slug );

        ws.send(JSON.stringify( {
            type: "active_users",
            data: { 
                active_users
            }
        } ))

        ws.send(JSON.stringify({
            type: "whoami",
            data: { 
                name: ws.locals.name
            }
        }))

        publishToChatroom(
            ws.locals.slug,
            JSON.stringify({
                type: "user_joined",
                data: {
                    user_name: ws.locals.name
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