/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { EventEmitter } from "events";
import { WebSocket } from "uWebSockets.js";

import appEvents from "../../../application/events/events";
import webEvents from "./events";

import mongoose from "mongoose";

const clients: { [key: string]: Array<WebSocket>} = {};
    
export default ( emitter: EventEmitter ) => {

    emitter.on(webEvents.NEW_CLIENT_CONNECTED, async (ws: WebSocket) => {

        if(!clients[ws.locals.slug])  
            clients[ws.locals.slug] = [];

        clients[ws.locals.slug].push(ws);   

        const active_users = getActiveUsers( ws.locals.slug );

        ws.send(JSON.stringify( {
            type: "active_users",
            data: { 
                active_users
            }
        } ))

        ws.send(JSON.stringify( {
            type: "whoami",
            data: { 
                name: ws.locals.name
            }
        } ))

        ws.publish(
            ws.locals.slug,
            JSON.stringify( {
                type: "user_joined",
                data: {
                    user_name: ws.locals.name
                }
            })
        )
    })

    emitter.on(webEvents.CLIENT_DISCONNECTED, async (ws: WebSocket) => {        
        
        if(!clients[ws.locals.slug])
            return;

        clients[ws.locals.slug] = clients[ws.locals.slug].filter( client => client !== ws );

        const randomSocket = getRandomSocket();

        if(!randomSocket)
            return;

        randomSocket.publish(
            ws.locals.slug,
            JSON.stringify( {
                type: "user_left",
                data: {
                    user_name: ws.locals.name
                }
            })
        )
    })

    emitter.on(appEvents.USER_KICKED_OUT, async ({ slug, user_name }) => {       
        const message = {
            author: `Server`,
            content: `${user_name} has been kicked out. Bye! 🚀🚀🚀`,
            _id: new mongoose.Types.ObjectId(),
            slug
        }

        emitter.emit(appEvents.NEW_MESSAGE, message);

        const randomSocket = getRandomSocket();

        if(randomSocket)
            randomSocket.publish(slug, JSON.stringify({
                type: "message",
                data: {
                    message
                }
            }))

        const ws = clients[slug]?.find( client => !client.closed && client.locals.name === user_name);

        if(!ws || ws.closed)
            return;

        ws.send(JSON.stringify({ type: "kick" }))

        setTimeout(() => !ws.closed && ws.close(), 250);
    });
}

function getRandomSocket(): WebSocket | null {
    for(const key in clients) {
        if(clients[key].length > 0)
            return clients[key][0];
    }
    return null;
}

function getActiveUsers(slug: string): Array<string> {

    const result = clients[slug].map( ws => ws.locals.name )

    return result;
}