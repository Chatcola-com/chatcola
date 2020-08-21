/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import Chatroom from "../src/application/entities/chatroom";

import ms from "ms";

describe("Chatroom domain entity", () => {

    let chatroom: Chatroom;

    beforeEach(() => {
        chatroom = Chatroom.createNew({
            name: "Sample chatroom",
            valid_until: Date.now() + ms("1 hour"),
            max_users: 10,
            auth_type: "none",
            access_tokens_amount: 0
        });
    });


    it("Should prefill fields with defaults", () => {
        expect( typeof chatroom._id ).toBe("string");
        expect( typeof chatroom.users ).toBe("object");
        expect( typeof chatroom.free_access_tokens ).toBe("object");
        expect( typeof chatroom.slug ).toBe("string");
        expect( typeof chatroom.admin_slug ).toBe("string");
        expect( typeof chatroom.admin_password ).toBe("string");
        expect( typeof chatroom.banned_users ).toBe("object");

        expect( chatroom.users.length ).toBe(0);
        expect( chatroom.banned_users.length ).toBe(0);
        expect( chatroom.free_access_tokens.length ).toBe(0);
    });

    it("Should pass authentication when auth_type is 'none' and max_users is not reached", () => {
        const authenticationResult = chatroom.authenticate({
            name: "@some_user_name"
        });

        expect(authenticationResult).toBeTruthy();
    });

    it("Should be able to change auth_type and add access tokens", () => {
        chatroom.addAccessTokens(10);

        expect(chatroom.auth_type).toBe("access_tokens");
        expect(chatroom.free_access_tokens.length).toBe(10);
    });

    it(`Should pass authentication without registration with same access token twice
     (ASKING THE QUESTION SHOULD NOT CHANGE THE ANSWER)`, () => {
        chatroom.addAccessTokens(10);

        const firstAccessToken = chatroom.free_access_tokens[0];

        const firstAuthResult = chatroom.authenticate({
            name: "@sample_name",
            access_token: firstAccessToken
        });

        const secondAuthResult = chatroom.authenticate({
            name: "@sample_name",
            access_token: firstAccessToken
        });

        expect(firstAuthResult).toBeTruthy();
        expect(secondAuthResult).toBeTruthy();
    });

    it("Should NOT pass authentication with an invalid access token", () => {
        chatroom.addAccessTokens(5);

        const authenticationResult = chatroom.authenticate({
            name: "@some_user_name",
            access_token: chatroom.free_access_tokens[0] + "hehe"
        });

        expect(authenticationResult).toBeFalsy();
    });

    it("Should allow registration when max_users is not reached", () => {
        chatroom.max_users = 100;
        const name = "@some_user_name";

        chatroom.checkPresenceOfUser(name)

        const registrationResult = chatroom.registerUser({ name });

        expect(registrationResult).toBeTruthy();
        expect( chatroom.checkPresenceOfUser(name) ).toBeTruthy();
    });

    it("Should NOT allow registration when max_users is reached", () => {
        chatroom.max_users = 0;

        const registrationResult = chatroom.registerUser({
            name: "@some_user_name"
        });

        expect(registrationResult).toBeFalsy();
    });

    it("Should pass admin authentication when correct admin_slug and admin_password are provided", () => {
        const authenticationResult = chatroom.adminAuthenticate({ 
            admin_slug: chatroom.admin_slug,
            admin_password: chatroom.admin_password
        });

        expect(authenticationResult).toBeTruthy();
    });

    it("Should pass admin authentication when correct admin_slug and admin_password are provided", () => {
        const authenticationResult = chatroom.adminAuthenticate({ 
            admin_slug: chatroom.admin_slug,
            admin_password: chatroom.admin_password + "E"
        });

        expect(authenticationResult).toBeFalsy();
    });


    it("Should allow user banning", () => {
        const name = "@some_user_name"

        chatroom.registerUser({ name });

        expect(chatroom.isUserBanned(name)).toBeFalsy();
    
        chatroom.banUser(name);

        expect(chatroom.isUserBanned(name)).toBeTruthy();
    });

    it("Should not let log in using revoked access token", () => {
        chatroom.addAccessTokens(10);

        const firstAccessToken = chatroom.free_access_tokens[0];

        chatroom.removeAccessToken(firstAccessToken);

        const authenticationResult = chatroom.authenticate({
            name: "@sample_name",
            access_token: firstAccessToken
        });

        expect(authenticationResult).toBeFalsy();
    });

    it("Should display used access tokens alongside unused ones", () => {
        chatroom.addAccessTokens(10);

        const access_token = chatroom.free_access_tokens[0];

        chatroom.authenticate({ 
            name: "some_user_name",
            access_token
        });

        chatroom.registerUser({
            name: "some_user_name",
            access_token
        })

        expect(chatroom.free_access_tokens.length).toBe(9);
        expect(chatroom.access_tokens.length).toBe(10);
    });

    it("Should assign subscription id to user correctly", () => {
        const name = "some_user_name";
        const subscriptionId = "123123123";

        chatroom.registerUser({ name });
        chatroom.assignSubscriptionIdToUser(subscriptionId, "@"+name);

        expect(chatroom.users[0].subscription_id).toBe(subscriptionId);
    });

    it("Should let the user leave and not add him to banned list", () => {
        const name = "seiufjuisoefjiusefjfiesjf";
        
        chatroom.registerUser({ name });
        chatroom.removeUser("@"+name);

        expect(
            chatroom.users.length
        )
        .toEqual(
            0
        );
        
        expect(
            chatroom.banned_users.length
        )
        .toEqual(
            0
        );
    });
})