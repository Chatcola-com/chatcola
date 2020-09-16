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
import events from "./events";

import { Container } from "typedi";
import { EventEmitter } from "events";

import { TKeyValueStore } from "../../types/infrastructure";

const emitter = Container.get<EventEmitter>("eventEmitter");

const keyValueStore = Container.get<TKeyValueStore>("keyValueStore");

export default () => {

    emitter.on(events.NEW_CHATROOM, async () => {
        let chatroomCount = keyValueStore.getItem("CHATROOM_COUNT");
        if((typeof chatroomCount) !== "number")
            chatroomCount = 0;

        keyValueStore.setItem("CHATROOM_COUNT", chatroomCount + 1);
    });

}