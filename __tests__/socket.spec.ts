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
import Container from "typedi";

import ActiveSocketsManager from "../src/application/socket/activeSockets";
import { v4 as uuidv4 } from "uuid";

import router from "../src/application/socket/router";

const socketManager = Container.get(ActiveSocketsManager);


describe("The socket router", () => {

    it("Should emit back the message", () => {

      const {
        sockets,
        slug,
        contexts
      } = getMockedChatroomAndUsers();
      
      router(
        {
          type: "message",
          data: {
            content: "hehehe",
          },
        },
        contexts[0]
      );

      sockets.forEach(socket => {

        expect(socket.send).toHaveBeenCalledTimes(1);
        
        const calledWithEvent = socket.send.mock.calls[0][0];
        const { _id, ...restOfEvent } = calledWithEvent;
        expect(restOfEvent).toMatchObject({
          type: "message",
          data: {
            message: {
              content: "hehehe",
              author: contexts[0].name,
            },
          },
        });
      })
  });

  it("Should send back a ping", () => {

    const {
      sockets,
      slug,
      contexts
    } = getMockedChatroomAndUsers();

    router({
      type: "ping",
      data: {}
    }, contexts[0]);

    expect(sockets[0].send).toHaveBeenCalledWith({
      type: "pong",
      data: {}
    })
    
  })

  it("Should do nothing on unknown event", () => {

    const {
      sockets,
      slug,
      contexts
    } = getMockedChatroomAndUsers();

    router({
      type: "dudududududududuu im an unknown event",
      data: {}
    }, contexts[0]);

    expect(sockets[0].send).not.toHaveBeenCalled()
    
  })

  it("Should broadcast start_typing event", () => {

    const {
      sockets,
      slug,
      contexts
    } = getMockedChatroomAndUsers();

    router({
      type: "start_typing",
      data: {}
    }, contexts[0]);

    sockets.forEach(socket => {
      expect(socket.send).toHaveBeenCalledWith({
        type: "start_typing",
        data: {
          userName: contexts[0].name
        }
      });
    })
    
  })

  it("Should broadcast stop_typing event", () => {

    const {
      sockets,
      slug,
      contexts
    } = getMockedChatroomAndUsers();

    router({
      type: "stop_typing",
      data: {}
    }, contexts[0]);

    sockets.forEach(socket => {
      expect(socket.send).toHaveBeenCalledWith({
        type: "stop_typing",
        data: {
          userName: contexts[0].name
        }
      });
    })
    
  })
});

describe("ActiveSocketsManager", () => {

  const {
    slug: slug_1,
    sockets: sockets_1
  } = getMockedChatroomAndUsers()

  const {
    slug: slug_2,
    sockets: sockets_2
  } = getMockedChatroomAndUsers();

  it("Should broadcast a message on publishToChatroom", () => {

      socketManager.publishToChatroom(slug_1, {
          "E": "F"
      });

      sockets_1.forEach(socket => {
        expect(socket.send).toHaveBeenCalledWith({
          "E": "F"
        });
      })

      sockets_2.forEach(socket => {
        expect(socket.send).not.toHaveBeenCalledWith({
          "E": "F"
        });
      })
  });

  it("Should return a socket of user of name if they didnt disconnect", () => {

    const socket = socketManager.getSocketOfUser(
      slug_1, 
      sockets_1[0].locals.name
    );

    expect(socket).toBeTruthy();

    expect(
      () => socket!.send({})
    ).not.toThrowError();
  });

  it("Should NOT return a socket of user of name if they disconnected", () => {

    socketManager.socketLeft(sockets_1[0]);

    const socket = socketManager.getSocketOfUser(
      slug_1, 
      sockets_1[0].locals.name
    );

    expect(socket).not.toBeTruthy();
  });

})



function getMockedChatroomAndUsers() {

  const slug = uuidv4();

  const names = ["@andrzej", "@dominika", "@seba"];

  const sockets = names.map(name => getFakeSocket(slug, name));
  const contexts = names.map(name => ({name, slug}))

  for(const i in sockets) {
    socketManager.socketJoined(sockets[i]);
  }

  for(const i in sockets) {
    sockets[i].send.mockClear();
  }

  return {
    names,
    sockets,
    slug,
    contexts
  }
}

function getFakeSocket(slug: string, name: string) {
  return {
    close: jest.fn(),
    isOpen: jest.fn(() => true),
    send: jest.fn(),
    locals: {
      slug,
      name,
      isInCall: false
    }
  }
}