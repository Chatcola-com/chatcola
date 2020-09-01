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
import { Container } from "typedi";
import { Server } from "http";
import url from "url";

import Ws from "ws";
import AuthService from "../../application/auth.service";
import { AppError } from "../../infrastructure/utils";
import socketRouter from "../../application/socket/router";
import { EventEmitter } from "events";

import events from "../../application/events/events";
import { publishToChatroom } from "../../application/socket/activeSockets";

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
        //@ts-ignore
        ws.isOpen = () => ws.readyState === Ws.OPEN

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
