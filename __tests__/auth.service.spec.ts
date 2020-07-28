/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
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
      chatroomAfter.users.length
    ).toEqual(0);

    expect(
      chatroomAfter.banned_users.length
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
