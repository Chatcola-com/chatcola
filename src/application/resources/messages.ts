import { Container } from "typedi";

import MessageService from "../message.service";

const messageService = Container.get(MessageService);

export async function getMessages(slug: string) {

    const messages = await messageService.get(slug);

    return {
        success: true,
        data: messages
    }

}