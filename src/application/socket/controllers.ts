/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
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