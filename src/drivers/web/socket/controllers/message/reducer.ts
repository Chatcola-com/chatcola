/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { WebSocket } from "uWebSockets.js";
import { EventEmitter } from "events";

import { Container } from "typedi";

import appEvents from "../../../../../application/events/events";
import Message from "../../../../../application/entities/message";

const emitter = Container.get<EventEmitter>("eventEmitter");

export function start_typing (ws: WebSocket) {

  ws.publish(ws.locals.slug, JSON.stringify({
    type: "start_typing",
    data: {
      userName: ws.locals.name
    }
  }));
}
  
export function stop_typing (ws: WebSocket) {

  ws.publish(ws.locals.slug, JSON.stringify({
    type: "stop_typing",
    data: {
      userName: ws.locals.name
    }
  }));
}
export function whoami (ws: WebSocket, data: any) {
  ws.send(JSON.stringify({
    type: "whoami",
    data: {
      yourName: ws.locals.name
    }
  }));
}
export function ping (ws: WebSocket, data: any) {
  ws.send(JSON.stringify({
    type: "ping",
    data: {}
  }))
}
export function message (ws: WebSocket, data: any) {
  const { name: author, slug } = ws.locals;
  const { content } = data;

  //TODO: yup.validate here

  const message = Message.createNew({
    author,
    slug,
    content,
  });

  emitter.emit(appEvents.NEW_MESSAGE, message)
  
  ws.publish(slug, JSON.stringify({
    type: "message",
    data: {
      message
    }
  }));
}