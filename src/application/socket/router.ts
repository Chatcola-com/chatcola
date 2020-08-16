import * as Controller from "./controllers";
import incomingMessageSchema from "./schema";

import { TSocketResponse } from "./schema";
import { AppError } from "../../infrastructure/utils";

type TParsedBody = { [key: string]: any; };
type TSocketContext = {
    name: string;
    slug: string;
}

export type TChatroomSocket = {
    locals: {
        slug: string;
        name: string;
    }
    publishToChatroom: (message: string) => any;
    send: (message: string) => any;
    close: () => any;   
}

export const activeSockets: {
    [slug: string]: TChatroomSocket[]
} = {};

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