/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import events from "./events";

import { Container } from "typedi";
import { EventEmitter } from "events";

import MessageService from "../message.service";
import { TMessage } from "../../application/entities/message";
import { TChatroom } from "../../application/entities/chatroom";

import { TKeyValueStore } from "../../types/infrastructure";

const eventEmitter = Container.get<EventEmitter>("eventEmitter");

const messageService = Container.get(MessageService);

const keyValueStore = Container.get<TKeyValueStore>("keyValueStore");

import * as sendPushNotifications from "../resources/sendPushNotifications";

export default () => {

    eventEmitter.on(events.NEW_CHATROOM, async (details: TChatroom) => {
        let chatroomCount = keyValueStore.getItem("CHATROOM_COUNT");
        if((typeof chatroomCount) !== "number")
            chatroomCount = 0;

        keyValueStore.setItem("CHATROOM_COUNT", chatroomCount + 1);
    });

    eventEmitter.on(events.NEW_MESSAGE, async (message: TMessage) => {
        messageService.new(message);

        sendPushNotifications.aboutIncomingMessage(message.slug, message);
    });
}