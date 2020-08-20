/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { Container } from "typedi";
import { Server } from "http";
import url from "url";

import Ws from "ws";
import AuthService from "../../../application/auth.service";
import { AppError } from "../../../infrastructure/utils";
import socketRouter from "../../../application/socket/router";
import { EventEmitter } from "events";

import events from "../../../application/events/events";
import { publishToChatroom } from "../../../application/socket/activeSockets";

const authService = Container.get(AuthService);
const eventEmitter = Container.get<EventEmitter>("eventEmitter");

export default function websocketLoader(server: Server) {

    const wss = new Ws.Server({ 
        server,
        verifyClient: authenticatePreSocket
    });


    wss.on("connection", function(ws, req) {

        //@ts-ignore
        ws.locals = req.locals;

        eventEmitter.emit(events.NEW_CLIENT_CONNECTED, ws);

        ws.on("close", () => {
            eventEmitter.emit(events.CLIENT_DISCONNECTED, ws);
        })
       
        ws.on("message", function(data) {

             //@ts-ignore
            const context = ws.locals;

            try {
                const message = JSON.parse(data.toString());
                
                const result = socketRouter(message, context);

                if(!result)
                    return;

                else if(result.broadcast) 
                    publishToChatroom(context.slug, JSON.stringify(result.body));
                else 
                    ws.send(JSON.stringify(result.body));
                
            }
            catch ( error ) {
                if(
                    !(error instanceof AppError) ||
                    error.shouldReport
                )
                    throw error;
            }
        })

    })
}


async function authenticatePreSocket({ req }: any, done: any) {

    const pathname = url.parse(req.url).pathname;

    try {
        const token = pathname?.split("/").pop();

        const claims = await authService.validateChatUserToken(token!);

        req.locals = {
            slug: claims.slug,
            name: claims.name
        };

        done(true);
    }
    catch ( error ) {
        if(
            error instanceof AppError && 
            !error.shouldReport
        ) {
            done(false);
        }
        else
            throw error;
    }

    
}
