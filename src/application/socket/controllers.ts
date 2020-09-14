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

import * as activeSockets from "./activeSockets";

const emitter = Container.get<EventEmitter>("eventEmitter");


export function start_typing (slug: string, userName: string) {
  const socket = activeSockets.getUserFromChatroom(
    slug,
    userName
  );
  
  socket?.send({
    type: "start_typing",
    data: {
        userName
    }
  });
}
  
export function stop_typing (slug: string, userName: string) {
  const socket = activeSockets.getUserFromChatroom(
    slug,
    userName
  );
  
  socket?.send({
    type: "stop_typing",
    data: {
        userName
    }
  })
}

export function whoami (slug: string, userName: string) {

  const socket = activeSockets.getUserFromChatroom(
    slug,
    userName
  );

  socket?.send({
    type: "whoami",
    data: {
        yourName: userName
    }
  })
}
export function ping (slug: string, userName: string) {
  const socket = activeSockets.getUserFromChatroom(
    slug,
    userName
  );

  socket?.send({
    type: "pong",
    data: {}
  });
}
export function message ({ authorName, slug, content }: { 
  authorName: string;
  slug: string;
  content: string;
}) {

  const message = Message.createNew({
    author: authorName,
    slug,
    content,
  });

  emitter.emit(events.NEW_MESSAGE, message);

  activeSockets.publishToChatroom(
    slug,
    {
      type: "message",
      data: {
        message
      }
    }
  )

}

export function join_call(slug: string, userName: string) {

  console.log(userName, " joined call");
  
  const socket = activeSockets.getUserFromChatroom( slug, userName );

  if(socket)
    socket.locals.isInCall = true;

  activeSockets.publishToChatroom(
    slug,
    {
      type: "user_joined_call",
      data: {
        user_name: userName
      }
    }
  )
}

export function leave_call(slug: string, userName: string) {
  console.log(userName, " left call");
  
  const socket = activeSockets.getUserFromChatroom( slug, userName );

  if(socket)
    socket.locals.isInCall = false;

  activeSockets.publishToChatroom(
    slug,
    {
      type: "user_left_call",
      data: {
        user_name: userName
      }
    }
  )
} 

export function call_signal(slug: string, username: string, signal: {
  kind: string;
  targetUser: string;
  payload: string;
}) {
  console.log("call signal: ", signal);

  const targetSocket = activeSockets.getUserFromChatroom(
    slug,
    signal.targetUser
  );

  targetSocket?.send({
    type: "call_signal",
    data: {
      ...signal,
      sendingUser: username
    }
  })
}