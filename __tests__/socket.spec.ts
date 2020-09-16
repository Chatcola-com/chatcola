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

  describe("ActiveSocketsManager", () => {

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

    const socketManager = new ActiveSocketsManager();

    const slug_1 = "2323232323";
    const sockets_1 = [
      getFakeSocket(slug_1, "andrzej"),
      getFakeSocket(slug_1, "wieslaw"),
      getFakeSocket(slug_1, "dominika"),        
    ]

    for(const i in sockets_1) {
      socketManager.socketJoined(sockets_1[i]);
      sockets_1[i].send.mockClear();
    }

    const slug_2 = "3434534345";
    const sockets_2 = [
      getFakeSocket(slug_2, "michal"),
      getFakeSocket(slug_2, "przemek"),
      getFakeSocket(slug_2, "piotrek"),        
    ]

    for(const i in sockets_2) {
      socketManager.socketJoined(sockets_2[i]);
      sockets_2[i].send.mockClear();
    }

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
});