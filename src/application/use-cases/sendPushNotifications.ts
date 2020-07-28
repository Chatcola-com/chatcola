/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { Container } from "typedi";

import { TMessage } from "../../application/entities/message";
import ChatroomService from "../chatroom.service";
import AlligatorService from "../alligator.service";

const chatroomService = Container.get(ChatroomService);
const alligatorService = Container.get(AlligatorService);


async function sendPushAboutIncomingMessage(slug: string, message: TMessage) {

    const subscriptionIds = 
        await chatroomService.getPushSubscribersIds(slug, message.author);

    await alligatorService.sendPushNotification(
        subscriptionIds,
        {
            type: "incomingMessage",
            data: message
        }
    )
}

export { sendPushAboutIncomingMessage as aboutIncomingMessage };