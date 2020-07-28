/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { Container } from "typedi";

import ChatroomService from "../src/application/chatroom.service";
import ChatroomManagementService from "../src/application/chatroom-management.service";
import AuthService from "../src/application/auth.service";

const chatroomService = Container.get(ChatroomService);
const chatroomManagementService = Container.get(ChatroomManagementService);
const authService = Container.get(AuthService);

const sampleChatroom = {
    access_tokens_amount: 0,
    auth_type: "none",
    max_users: 10,
    name: "|1232",
    valid_until: Date.now() + 345345435
}

describe("Chatroom management service", () => {

    it("Should let you revoke an access token", async () => {
        const { slug, access_tokens } = await chatroomService.new({
            ...sampleChatroom,
            auth_type: "access_tokens",
            access_tokens_amount: 5
        });

        const revokedToken = access_tokens[0].token;

        await chatroomManagementService.revokeAccessToken(slug, revokedToken);

        const chatroom = await chatroomService.getDetailed(slug);
        
        expect(
            chatroom.access_tokens.findIndex( ({ token }) => token === revokedToken )
        ).not.toBeGreaterThan(-1)
    });

    it("Should let you kick an user", async () => {
        const { slug } = await chatroomService.new({
            ...sampleChatroom,
            auth_type: "none"
        });

        const kicked_user_name = "klaudiusz";
        const not_kicked_user_name = "123123123123";

        await authService.login({ name: kicked_user_name, slug: slug });
        await authService.login({ name: not_kicked_user_name, slug: slug });

        await chatroomManagementService.kickUser(slug, "@"+kicked_user_name);

        const chatroomAfter = await chatroomService.getDetailed(slug);

        expect(
            chatroomAfter.users.length
        ).toEqual(1);

        expect(
            chatroomAfter.users[0].name
        ).toEqual("@"+not_kicked_user_name);
    });
    
    it("Should let you remove a chatroom", async () => {
        const { slug } = await chatroomService.new({
            ...sampleChatroom,
            auth_type: "none",
            access_tokens_amount: 0
        });

        await chatroomManagementService.remove(slug);

        const chatroomAfter = await chatroomService.getBasic(slug);

        expect(chatroomAfter).not.toBeTruthy();
    });

    it("Should let you generate more access tokens", async () => {
        const initialAmount = 5;
        const addedAmount = 5;

        const { slug } = await chatroomService.new({
            ...sampleChatroom,
            auth_type: "access_tokens",
            access_tokens_amount: initialAmount
        });

        await chatroomManagementService.generateAccessTokens(slug, addedAmount);

        const chatroomAfter = await chatroomService.getDetailed(slug);

        expect(
            chatroomAfter.access_tokens.length
        ).toEqual( initialAmount + addedAmount );
    });

    it("Should let you revoke an access token", async () => {
        const initialAmount = 5;

        const { slug, access_tokens } = await chatroomService.new({
            ...sampleChatroom,
            auth_type: "access_tokens",
            access_tokens_amount: initialAmount
        });

        const targetToken = access_tokens[0].token;

        await chatroomManagementService.revokeAccessToken(slug, targetToken);
    
        const chatroomAfter = await chatroomService.getDetailed(slug);

        expect(
            chatroomAfter.access_tokens.length
        ).toEqual(
            initialAmount - 1
        );

        expect(
            chatroomAfter.access_tokens.findIndex( t => t.token === targetToken )
        ).toBeLessThan(
            0
        )
    }); 
})