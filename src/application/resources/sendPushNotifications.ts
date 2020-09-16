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

import { TMessage } from "../entities/message";
import ChatroomService from "../chatroom.service";
import AlligatorService from "../alligator.service";

const chatroomService = Container.get(ChatroomService);
const alligatorService = Container.get(AlligatorService);


async function sendPushAboutIncomingMessage(message: TMessage) {

    const { slug } = message;

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