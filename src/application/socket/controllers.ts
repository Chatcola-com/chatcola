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
import { EventEmitter } from "events";

import { Container } from "typedi";

import events from "../events/events";
import Message from "../entities/message";
import { TSocketResponse } from "./schema";

const emitter = Container.get<EventEmitter>("eventEmitter");


export function start_typing (userName: string): TSocketResponse {
  return {
    broadcast: true,
    body: {
      type: "start_typing",
      data: {
          userName
      }
    }
  }
}
  
export function stop_typing (userName: string): TSocketResponse {
  return {
    broadcast: true,
    body: {
      type: "stop_typing",
      data: {
          userName
      }
    }
  }
}

export function whoami (nameOfTheUser: string): TSocketResponse {
  return {
    broadcast: false,
    body: {
      type: "whoami",
      data: {
          yourName: nameOfTheUser
      }
    }
  }
}
export function ping (): TSocketResponse {
  return {
    broadcast: false,
    body: {
      type: "pong",
      data: {}
    }
  }
}
export function message ({ authorName, slug, content }: { 
  authorName: string;
  slug: string;
  content: string;
}): TSocketResponse {

  const message = Message.createNew({
    author: authorName,
    slug,
    content,
  });

  emitter.emit(events.NEW_MESSAGE, message)
  
  return {
    broadcast: true,
    body: {
      type: "message",
      data: {
        message
      }
    }
  }
}