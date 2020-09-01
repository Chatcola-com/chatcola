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

import ChatroomService from "../src/application/chatroom.service";
import AuthService from "../src/application/auth.service";
import { TUserTokenClaims, TAdminTokenClaims } from "../src/types/auth";

const chatroomService = Container.get(ChatroomService);
const authService = Container.get(AuthService);

const sampleChatroom = {
  access_tokens_amount: 0,
  auth_type: "none",
  max_users: 10,
  name: "|1232",
  valid_until: Date.now() + 234234,
};

describe("Authentication service", () => {
  it("Should return a valid chat token after logging into a chatroom", async () => {
    const { slug } = await chatroomService.new({
      ...sampleChatroom,
      auth_type: "none",
      access_tokens_amount: 0,
    });

    const token = await authService.login({ slug, name: "zbigniew" });

    expect(typeof token).toEqual("string");

    const claims = <TUserTokenClaims>await authService.validateChatToken(token);

    expect(claims.slug).toEqual(slug);
    expect(claims.type).toEqual("user");
    expect(claims.name).toEqual("@zbigniew");
  });

  it("Should let user leave and remove him from the chatroom while not banning him", async () => {
    const { slug } = await chatroomService.new({
      ...sampleChatroom,
      auth_type: "none",
      access_tokens_amount: 0,
    });

    await authService.login({ slug, name: "zbigniew" });

    await authService.leave(slug, "@zbigniew");

    const chatroomAfter = await chatroomService.getDetailed(slug);

    expect(
      chatroomAfter?.users.length
    ).toEqual(0);

    expect(
      chatroomAfter?.banned_users.length
    ).toEqual(0);
  })

  it("Should NOT return a valid chat token if invalid credentials are provided", async () => {
    const { slug } = await chatroomService.new({
      ...sampleChatroom,
      auth_type: "access_tokens",
      access_tokens_amount: 5,
    });

    await expect(
      authService.login({ name: "zbigniew", slug })
    ).rejects.toMatchInlineSnapshot(`[Error: Bad credentials]`);

  });

  it("Should NOT return a valid chat token if username is taken", async () => {
    const { slug } = await chatroomService.new({
      ...sampleChatroom,
      auth_type: "none",
      access_tokens_amount: 0,
    });

    await expect(async () => {
      await authService.login({ name: "zbigniew", slug });
      await authService.login({ name: "zbigniew", slug });
    }).rejects.toMatchInlineSnapshot(`[Error: Username taken]`);
  });

  it("Should NOT return a valid chat token if chatroom is full", async () => {
    const { slug } = await chatroomService.new({
      ...sampleChatroom,
      auth_type: "none",
      access_tokens_amount: 0,
      max_users: 1,
    });

    await expect(async () => {
      await authService.login({ name: "zbigniew", slug });
      await authService.login({ name: "Andrzej", slug });
    }).rejects.toMatchInlineSnapshot(`[Error: Chatroom full]`);
  });

  it("Should return a valid push subscription holder token", async () => {
    const subscriptionId = "hehe";

    const token = await authService.getPushSubscriptionToken(subscriptionId);

    const claims = await authService.validatePushSubscriptionToken(token);

    expect(claims.subscriptionId).toEqual(subscriptionId);
  });

  it("Should fail when validating a fake push subscription holder token", async () => {

    await expect(
      authService.validatePushSubscriptionToken("a definetely fake token")
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Unauthorized"`);

  });

  it("Should return a valid chat admin token", async () => {
    const { admin_password, admin_slug, slug } = await chatroomService.new({
        ...sampleChatroom,
        auth_type: "none",
    });

    const adminToken = await authService.adminLogin({
        admin_slug,
        admin_password,
        slug
    });

    expect(typeof adminToken).toEqual("string");

    const claims = 
        <TAdminTokenClaims>await authService.validateChatToken(adminToken);

    expect(claims.type).toEqual("admin");
  });
});
