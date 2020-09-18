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
import * as Controller from "./controllers";
import incomingMessageSchema from "./schema";

import { AppError } from "../../infrastructure/utils";
import { ZodError } from "zod";

type TParsedBody = { [key: string]: any; };
type TSocketContext = {
    name: string;
    slug: string;
}

export default function socketRouter(body: TParsedBody, context: TSocketContext) {


    try {
        const message = incomingMessageSchema.parse(body);

        switch(message.type) {
            case "ping": return Controller.ping(context.slug, context.name);
            case "start_typing": return Controller.start_typing(context.slug, context.name);
            case "stop_typing": return Controller.stop_typing(context.slug, context.name);
            case "message": return Controller.message({
                authorName: context.name,
                slug: context.slug,
                content: message.data.content,
            });
            case "join_call": return Controller.join_call(context.slug, context.name);
            case "leave_call": return Controller.leave_call(context.slug, context.name);
            case "call_signal": return Controller.call_signal(context.slug, context.name, message.data)
            default: return null;
        }

    } catch ( error ) {

        if(
            (error instanceof ZodError) || error.name.toLowerCase() === "zoderror" ||
            (error instanceof AppError && !error.shouldReport)
        ) {
            console.log(`while receiving socket message: `, error, body, context);
            
            return null;
        }   
        else 
            throw error;
    }
}