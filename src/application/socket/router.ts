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

import { TSocketResponse } from "./schema";
import { AppError } from "../../infrastructure/utils";

type TParsedBody = { [key: string]: any; };
type TSocketContext = {
    name: string;
    slug: string;
}

export default function socketRouter(body: TParsedBody, context: TSocketContext): TSocketResponse | null {

    try {
        const message = incomingMessageSchema.parse(body);

        switch(message.type) {
            case "ping": return Controller.ping();
            case "start_typing": return Controller.start_typing(context.name);
            case "stop_typing": return Controller.stop_typing(context.name);
            case "message": return Controller.message({
                authorName: context.name,
                slug: context.slug,
                content: message.data.content,
            });
            default: return null;
        }

    } catch ( error ) {

        if(
            error instanceof AppError &&
            !error.shouldReport
        ) {
            console.error(`while receiving socket message: `, error, body, context);
            
            return null;
        }   
        else 
            throw error;
    }
}