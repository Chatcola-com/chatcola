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
import router from "../src/application/resources/router";

const sampleChatroom = {
  access_tokens_amount: 0,
  max_users: 10,
  name: "|1232",
  valid_until: Date.now() + 345356456,
};

describe("Resources router", () => {
  describe("Workflows", () => {
    it("Should let you create a chatroom, get an admin token using sent credentials and fetch detailed chatroom data", async () => {
      const creationResult = await router(
        `/api/chatroom/create`,
        {
          ...sampleChatroom,
          auth_type: "none",
          access_tokens_amount: 0,
        },
        {}
      );

      expect(creationResult.success).toEqual(true);

      expect(creationResult.data?.chatroom).toBeTruthy();

      const { access_tokens_amount, ...restOfSamplechatroom } = sampleChatroom;
      expect(creationResult.data?.chatroom).toMatchObject(restOfSamplechatroom);

      const { chatroom } = creationResult.data;

      const adminTokenResult = await router(
        `/api/auth/admin`,
        {
          slug: chatroom.slug,
          admin_slug: chatroom.admin_slug,
          admin_password: chatroom.admin_password,
        },
        {}
      );

      expect(adminTokenResult.success).toEqual(true);

      const { admin_token } = adminTokenResult.data;

      expect(typeof admin_token).toEqual("string");
      expect(admin_token).not.toEqual("");

      const detailedChatroomResult = await router(
        `/api/chatroom/detailed`,
        {},
        { token: admin_token }
      );

      expect(detailedChatroomResult.success).toEqual(true);

      expect(detailedChatroomResult.data?.chatroom).toBeTruthy();

      expect(Object.keys(detailedChatroomResult.data?.chatroom)).toEqual(
        expect.arrayContaining([
          "name",
          "banned_users",
          "auth_type",
          "users",
          "access_tokens",
        ])
      );
    });

    it("Should let users log in to the newly created chatroom and fetch basic chatroom data but not detailed chatroom data", async () => {
      const creationResult = await router(
        `/api/chatroom/create`,
        {
          ...sampleChatroom,
          auth_type: "none",
          access_tokens_amount: 0,
        },
        {}
      );

      const { chatroom } = creationResult.data;

      const userLoginResult = await router(
        `/api/auth/chatToken`,
        {
          slug: chatroom.slug,
          name: "Gabriel",
        },
        {}
      );

      expect(userLoginResult.success).toEqual(true);

      const { token } = userLoginResult.data;

      expect(typeof token).toEqual("string");
      expect(token).not.toEqual("");

      const basicChatroomResult = await router(
        `/api/chatroom/basic`,
        {},
        { token }
      );

      expect(basicChatroomResult.success).toEqual(true);

      expect(Object.keys(basicChatroomResult.data?.chatroom)).not.toEqual(
        expect.arrayContaining(["banned_users", "access_tokens"])
      );

      expect(Object.keys(basicChatroomResult.data?.chatroom)).toEqual(
        expect.arrayContaining(["name", "auth_type", "users"])
      );

      const detailedChatroomResult = await router(
        `/api/chatroom/detailed`,
        {},
        { token }
      );

      expect(detailedChatroomResult.success).toEqual(false);
      expect(detailedChatroomResult.data?.chatroom).not.toBeTruthy();

      expect(detailedChatroomResult.error).toMatchInlineSnapshot(
        `"Unauthorized: no admin token at /api/chatroom/detailed"`
      );
    });
  });

  describe("Authentication", () => {
    it("Should allow to get public RSA key without token", async () => {
      const publicRSAKeyResult = await router(`/api/publicRSAKey`, {}, {});

      expect(publicRSAKeyResult.success).toEqual(true);

      expect(publicRSAKeyResult.data?.publicRSAKey).toBeTruthy();
    });

    it("Should allow to get chatroom auth type without token", async () => {
      const creationResult = await router(
        `/api/chatroom/create`,
        {
          ...sampleChatroom,
          auth_type: "access_tokens",
          access_tokens_amount: 5,
        },
        {}
      );

      const { chatroom } = creationResult.data;

      const authTypeResult = await router(
        `/api/auth/type`,
        {
          slug: chatroom.slug,
        },
        {}
      );

      expect(authTypeResult.success).toEqual(true);
      expect(authTypeResult.data?.auth_type).toEqual("access_tokens");
    });
  });

  describe("Various", () => {
    it("Should report 404 error on unknown route", async () => {
      const unknownResult = await router(
        `/definetely/not/an/existing/route/`,
        {},
        {}
      );

      expect(unknownResult.success).toEqual(false);
      expect(unknownResult.error).toMatchInlineSnapshot(
        `"404 Route not found"`
      );
    });
  });
});
