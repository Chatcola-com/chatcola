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

import ActiveSocketsManager from "./activeSockets";
import MessageService from "../../application/message.service";

import * as sendPushNotifications from "../resources/sendPushNotifications";

const socketsManager = Container.get(ActiveSocketsManager);
const messageService = Container.get(MessageService);

export function start_typing (slug: string, userName: string) {

  socketsManager.publishToChatroom(
    slug,
    {
      type: "start_typing",
      data: {
          userName
      }
    });
}
  
export function stop_typing (slug: string, userName: string) {
  socketsManager.publishToChatroom(
    slug,
    {
      type: "stop_typing",
      data: {
          userName
      }
    });
}

export function whoami (slug: string, userName: string) {

  const socket = socketsManager.getSocketOfUser(
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
  const socket = socketsManager.getSocketOfUser(
    slug,
    userName
  );

  socket?.send({
    type: "pong",
    data: {}
  });
}
export async function message ({ authorName, slug, content, attachment }: { 
  authorName: string;
  slug: string;
  content: string;
  attachment?: {
    name: string;
    content: string;
  }
}) {

  const message = await messageService.new({
    author: authorName,
    slug,
    content,
    attachment
  });
  sendPushNotifications.aboutIncomingMessage(message);


  socketsManager.publishToChatroom(
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
  
  const socket = socketsManager.getSocketOfUser( slug, userName );

  if(socket)
    socket.locals.isInCall = true;

  socketsManager.publishToChatroom(
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
  const socket = socketsManager.getSocketOfUser( slug, userName );

  if(socket)
    socket.locals.isInCall = false;

  socketsManager.publishToChatroom(
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
  
  const targetSocket = socketsManager.getSocketOfUser(
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