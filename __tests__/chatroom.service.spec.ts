/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { Container } from "typedi";
import ChatroomService from "../src/application/chatroom.service";
import AuthService from "../src/application/auth.service";

const chatroomService = Container.get(ChatroomService);
const authService = Container.get(AuthService);

const sampleChatroom = {
    access_tokens_amount: 0,
    max_users: 10,
    name: "|1232",
    valid_until: Date.now() + 345356456
}

describe("Chatroom service", () => {
    
    it("Should return correct details in getDetailed & getBasic methods", async () => {
    
        const { slug } = await chatroomService.new({
            ...sampleChatroom,
            auth_type: 'none'
        });

        const basicChatroom = await chatroomService.getBasic(slug);

        expect(basicChatroom).toHaveProperty("name");
        expect(basicChatroom).toHaveProperty("users");
        expect(basicChatroom).toHaveProperty("slug");
        expect(basicChatroom).toHaveProperty("auth_type");

        const detailedChatroom = await chatroomService.getDetailed(slug);

        expect(detailedChatroom).toHaveProperty("name");
        expect(detailedChatroom).toHaveProperty("users");
        expect(detailedChatroom).toHaveProperty("access_tokens");
        expect(detailedChatroom).toHaveProperty("auth_type");
    });

    it("Should clear expired chatrooms properly", async () => {
        const { slug: expiredSlug } = await chatroomService.new({
            ...sampleChatroom,
            auth_type: "none",
            valid_until: Date.now() - 50000
        });

        const { slug: notExpiredSlug } =  await chatroomService.new({
            ...sampleChatroom,
            auth_type: "none",
            valid_until: Date.now() + 50000
        });


        await chatroomService.clearExpired();

        const expiredChatroom = await chatroomService.getBasic(expiredSlug);
        const notExpiredChatroom = await chatroomService.getDetailed(notExpiredSlug);

        //TODO: Implement mongodb-like $le {} operator in MockedRepository.deleteMany();
        /*
        expect(expiredChatroom).toBeFalsy();
        expect(notExpiredChatroom).not.toBeFalsy();
        */
    });

    it("Should return correct subscriptionIds", async () => {
        const chatroom = await chatroomService.new({
            ...sampleChatroom,
            access_tokens_amount: 0,
            auth_type: "none"
        });

        const userName1 = "Andrzej1";
        const userName2 = "Andrzej222";
        const userName3 = "Andrzej33333";

        await authService.login({ slug: chatroom.slug, name: userName1 })
        await authService.login({ slug: chatroom.slug, name: userName2 })
        await authService.login({ slug: chatroom.slug, name: userName3 })

        const subscriptionId1 = "1";
        const subscriptionId2 = "2";
        const subscriptionId3 = "3";

        await chatroomService.addSubscriptionToUser({ 
            chatroomSlug: chatroom.slug,
            subscriptionId: subscriptionId1,
            userName: "@"+userName1
        })
        await chatroomService.addSubscriptionToUser({ 
            chatroomSlug: chatroom.slug,
            subscriptionId: subscriptionId2,
            userName: "@"+userName2
        })
        await chatroomService.addSubscriptionToUser({ 
            chatroomSlug: chatroom.slug,
            subscriptionId: subscriptionId3,
            userName: "@"+userName3
        })

        /**
         * Note: We can't use Promise.all in either of cases.
         * Why? Because modyfing model in memory makes it dangerous
         * (only one user is saved/assigned subscription id)
         * Of course this has to be fixed for cases where many users enter the same 
         * chatroom at once (yikes)
         */
        
        const subscriptionIds = 
            await chatroomService.getPushSubscribersIds(chatroom.slug, "@"+userName3)
        
        expect(
            subscriptionIds.length
        ).toEqual(2);

        expect(
            subscriptionIds.sort( (lhs, rhs) => lhs < rhs ? -1 : 1 )
        )
        .toEqual([subscriptionId1, subscriptionId2]);
        
        expect(
            subscriptionIds
        ).not.toContain(subscriptionId3);
    });


    it("Should let you add a subscription to chatroom user", async () => {
        const chatroom = await chatroomService.new({
            ...sampleChatroom,
            access_tokens_amount: 0,
            auth_type: "none"
        });

        await authService.login({
            slug: chatroom.slug,
            name: "Andrzej"
        })

        const subscriptionId = "34324432423";

        await chatroomService.addSubscriptionToUser({
            chatroomSlug: chatroom.slug,
            subscriptionId,
            userName: "@Andrzej"
        })

        const chatroomAfter =
            await chatroomService.getDetailed(chatroom.slug);

        expect(
            typeof chatroomAfter?.users[0].subscription_id
        ).toEqual("string");

        expect(
            chatroomAfter?.users[0].subscription_id
        ).toEqual(subscriptionId)
    });

})