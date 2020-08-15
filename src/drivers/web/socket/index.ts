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

import webEvents from "../events/events";

const authService = Container.get(AuthService);
const eventEmitter = Container.get<EventEmitter>("eventEmitter");

export default function websocketLoader(server: Server) {

    const wss = new Ws.Server({ 
        server,
        verifyClient: authenticatePreSocket
    });

    function publishToSlug(slug: string, message: string) { 
        wss.clients.forEach( ws => {
            
            //@ts-ignore
            const currentClientSlug = ws?.locals?.slug;

            if(currentClientSlug === slug)
                ws.send(message);
        })
    }

    wss.on("connection", function(ws, req) {

        //@ts-ignore
        ws.locals = req.locals;
        //@ts-ignore
        ws.publishToChatroom = (message: string) => publishToSlug(ws.locals.slug, message);


        eventEmitter.emit(webEvents.NEW_CLIENT_CONNECTED, ws);

        ws.on("close", () => {
            eventEmitter.emit(webEvents.CLIENT_DISCONNECTED, ws);
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
                    publishToSlug(context.slug, JSON.stringify(result.body));
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

/*import uWS from "uWebSockets.js";

import ms from "ms";

import { open, message, close, upgrade } from "./controllers";


export default (app: uWS.TemplatedApp) => {

    app.ws('/s/:chatUserToken', {
        
        compression: 0,
        maxPayloadLength: 16 * 1024 * 1024,
        idleTimeout: ms("1 hour") * 1000,
        
        upgrade,
        open,
        message,
        close
    });

}*/