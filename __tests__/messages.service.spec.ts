/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { Container } from "typedi";

import MessageService from "../src/application/message.service";

const messageService = Container.get(MessageService);

describe("Messages service", () => {

    const sampleMessage = {
        author: "@anteeek",
        content: "hehehehe",
        slug: "23-23-23-23-23-23-23-23",
    };

    it("Should let you add a new message", async () => {
        const { _id } = await messageService.new(sampleMessage);

        const messagesOfChatroom = 
            await messageService.get(sampleMessage.slug);

        const indexOfOurMessage = 
            messagesOfChatroom.findIndex( message => message._id === _id );

        expect(indexOfOurMessage).toBeGreaterThanOrEqual(0);
    });

    it("Should clear all chatroom's messages when requested", async () => {
        await messageService.new(sampleMessage);

        await messageService.clearAll(sampleMessage.slug);

        const messagesOfChatroom = 
            await messageService.get(sampleMessage.slug);

        expect(messagesOfChatroom.length).toEqual(0);
    });

    it("Should clear messages created by specific user when requested", async () => {

        const notTargettedUserName = "Piotr";
        const targettedUserName = "Andrzej";

        await Promise.all([
            messageService.new({
                ...sampleMessage,
                author: targettedUserName
            }),
            messageService.new({
                ...sampleMessage,
                author: notTargettedUserName
            })
        ]);

        await messageService.clearOfUser(
            sampleMessage.slug, 
            targettedUserName
        );

        const messagesOfChatroom = 
            await messageService.get(sampleMessage.slug);

        const countOfTargettedUsersMessages = 
            messagesOfChatroom.filter( message => message.author === targettedUserName ).length;

        const countOfNotTargettedUsersMessages = 
            messagesOfChatroom.filter( message => message.author === notTargettedUserName ).length;

        expect(countOfTargettedUsersMessages).toEqual(0);
        expect(countOfNotTargettedUsersMessages).not.toEqual(0);
    });

})