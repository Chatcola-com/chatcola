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

    it("Should let you get a single message by its id", async () => {
        const { _id } = await messageService.new(sampleMessage);

        const foundMessage = await messageService.getOfId(_id);

        expect(foundMessage).toBeTruthy();
        expect(foundMessage).toMatchObject(sampleMessage);
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

    describe("Attachments", () => {

        const sampleAttachment = {
            name: "hehe.jpg",
            content: "10"
        };

        it("Should save and provide attachment upon message creation", async () => {

            const message = await messageService.new({
                ...sampleMessage,
                attachment: sampleAttachment
            });

            const retrievedMessage = await messageService.getOfId(message._id);

            expect(retrievedMessage?.attachment).toEqual({
                name: sampleAttachment.name
            })

            const retrievedAttachment = await messageService.getAttachmentOfMessage(
                message._id
            );

            expect(retrievedAttachment).toBeTruthy();
            expect(retrievedAttachment).toEqual(sampleAttachment.content);
        })


        it("Should delete associated attachments upon user's message deletion", async () => {

            const notTargettedUserName = "Piotr";
            const targettedUserName = "Andrzej";

            const [message1, message2] = await Promise.all([
                messageService.new({
                    ...sampleMessage,
                    author: targettedUserName,
                    attachment: {
                        name: "hehehe.jpeg",
                        content: "010101010010101010101010010101010"
                    }
                }),
                messageService.new({
                    ...sampleMessage,
                    author: notTargettedUserName,
                    attachment: {
                        name: "matura.pdf",
                        content: "23848348589347858934758934745893345"
                    }
                })
            ]);

            await messageService.clearOfUser(
                sampleMessage.slug, 
                targettedUserName
            );

            expect(
                await messageService.getAttachmentOfMessage(
                    message1._id
                )
            ).not.toBeTruthy(); 

            expect(
                await messageService.getAttachmentOfMessage(
                    message2._id
                )
            ).toBeTruthy();

        });

        it("Should delete all attachments upon all messages deletion", async () => {

            const [message1, message2] = await Promise.all([
                messageService.new({
                    ...sampleMessage,
                    attachment: sampleAttachment
                }),
                messageService.new({
                    ...sampleMessage,
                    attachment: sampleAttachment
                })
            ]);

            await messageService.clearAll(sampleMessage.slug);

            expect(
                await messageService.getAttachmentOfMessage(
                    message1._id
                )
            ).not.toBeTruthy(); 

            expect(
                await messageService.getAttachmentOfMessage(
                    message2._id
                )
            ).not.toBeTruthy();

        });

    });

})