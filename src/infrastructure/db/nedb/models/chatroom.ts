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
import { TChatroom } from "../../../../application/entities/chatroom";
import { createCollection } from "./utils";
import Chatroom from "../../../../application/entities/chatroom";

import config from "../../../config";

export function serialize(chatroom: TChatroom): TChatroom {
    return chatroom;
}

export function deserialize(chatroom: TChatroom): Chatroom {

    return new Chatroom(chatroom);
}


export const model = createCollection(config.nedbPathChatrooms);