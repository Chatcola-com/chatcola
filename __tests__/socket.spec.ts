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

import router from "../src/application/socket/router";

describe("Socket router", () => {

  const sampleSlug = "23-23-23-23-23-23";

  function getFakeSocket(username: string) {
    return {
      close: jest.fn(),
      isOpen: jest.fn(() => true),
      send: jest.fn(),
      locals: {
        name: username,
        isInCall: false,
        slug: sampleSlug
      },
    };
  }

  function getSocketManager() {
    const localSocketManager = new ActiveSocketsManager();
    Container.set(ActiveSocketsManager, localSocketManager);

    const sampleUsers = ["@andrzej", "@wieslaw", "@dagmara"];
    const sampleSockets = sampleUsers.map(user => getFakeSocket(user));
    const sampleContexts = sampleUsers.map(user => ({
      name: user,
      slug: sampleSlug
    }));

    sampleSockets.forEach(socket => localSocketManager.socketJoined(socket));

    for(const i in sampleSockets) {
      sampleSockets[i].send.mockClear();
    }

    return {
      socketManager: localSocketManager,
      sampleSockets,
      sampleUsers,
      sampleContexts
    };
  }

  it('Should send a "pong" on "ping"', async () => {

    const { 
      socketManager,
      sampleSockets,
      sampleContexts,
      sampleUsers
    } = getSocketManager();

    router(
      {
        type: "ping",
        data: {},
      },
      sampleContexts[0]
    );
    
    expect(sampleSockets[0].send).toHaveBeenCalledWith({ type: "pong", data: {} });

    expect(sampleSockets[1].send).not.toHaveBeenCalled();
    expect(sampleSockets[2].send).not.toHaveBeenCalled();
    
  });

  it('Should broadcast "stop_typing" on receiving such event', async () => {

    const { 
      socketManager,
      sampleSockets,
      sampleContexts,
      sampleUsers
    } = getSocketManager();

    router(
      {
        type: "start_typing",
        data: {},
      },
      sampleContexts[0]
    );

    sampleSockets.forEach(socket => {
      expect(socket.send).toHaveBeenCalledWith({
        type: "start_typing",
        data: {
          userName: sampleContexts[0].name,
        },
      })
    });

  });

  it(`Should broadcast "stop_typing" on receiving such event"`, async () => {
      router(
        {
          type: "stop_typing",
          data: {},
        },
        sampleContexts[0]
      );
      
      sampleSockets.forEach(socket => {

        expect(socket.send).toHaveBeenCalledWith({
          type: "stop_typing",
          data: {
            userName: sampleContexts[0].name,
          },
        })

      });
    })

  })

  it("Should emit back the message", () => {
    router(
      {
        type: "message",
        data: {
          content: "hehehe",
        },
      },
      sampleContexts[0]
    );

    sampleSockets.forEach(socket => {

      const calledWithEvent = socket.send.mock.calls[0][0];

      const { _id, ...restOfEvent } = calledWithEvent;

      expect(restOfEvent).toMatchObject({
        type: "message",
        data: {
          message: {
            content: "hehehe",
            author: sampleContexts[0].name,
          },
        },
      });

    })

});