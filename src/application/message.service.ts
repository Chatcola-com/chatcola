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
import { Inject, Service } from "typedi";
import { EventEmitter } from "events";
import { AppError } from "../infrastructure/utils";


import Message, { TMessage } from "./entities/message";
import { IFileService, TMessageRepository } from "../types/infrastructure";
import events from "./events/events";


const FILE_NAMESPACE = "attachment";

const MAX_ATTTACHMENT_SIZE = 1024*1024*5; // this is LITERALLY 5 megabytes


@Service()
export default class MessageService {

    constructor(
        @Inject("messageRepository") private messageRepository: TMessageRepository,
        @Inject("fileService") private fileService: IFileService,
        @Inject("eventEmitter") private eventEmitter: EventEmitter
    ) {};

    async getAttachmentOfMessage(messageId: string): Promise<string | null> {
        return await this.fileService.readFile(FILE_NAMESPACE, messageId);
    }

    async eraseAttachmentOfMessage(messageId: string): Promise<void> {
        await this.fileService.eraseFile(FILE_NAMESPACE, messageId);
    }

    async get (slug: string): Promise< Array<TMessage> > {
        const messages = await this.messageRepository.find({ slug });
        
        messages.sort( (lhs, rhs) => lhs > rhs ? 1 : -1 );

        return messages;
    }

    async getOfId(targetId: string): Promise<TMessage | null> {
        const message = await this.messageRepository.findOne({ _id: targetId })

        return message;
    }

    async new (details: {slug: string; author: string; content: string, attachment?: {
        name: string;
        content: string;
    }}) {

        const { attachment, ...messageDetails } = details;

        const message = Message.createNew({
            ...messageDetails,
            attachment: attachment ? {
                name: attachment.name
            } : undefined
        });

        this.eventEmitter.emit(events.NEW_MESSAGE);
        
        await this.messageRepository.save(message);

        if(attachment) {
            if(attachment.content.length > MAX_ATTTACHMENT_SIZE)
                throw new AppError(`Attachment too large: received ${attachment.content.length} bytes`, {
                    shouldReport: true
                });

            await this.fileService.writeFile(FILE_NAMESPACE, message._id, attachment.content);
        }
       
        
        return message;
    }

    async clearStale (): Promise<void> {
        const yesterdayThisTime = new Date( Date.now() );
        yesterdayThisTime.setDate( yesterdayThisTime.getDate() - 1 );
        
        const results = await this.messageRepository.find({
            createdAt: {
                $lte: yesterdayThisTime
            }
        });

        await this.deleteAtachmentsOfMessages(results);

        await this.messageRepository.deleteMany({
            createdAt: {
                $lte: yesterdayThisTime
            }
        })
    }

    async clearAll (slug: string): Promise<number> {
        const targetMessages = await this.messageRepository.find({ slug });

        await this.deleteAtachmentsOfMessages(targetMessages);

        const deletionResult = await this.messageRepository.deleteMany({ slug });

        return deletionResult?.deletedCount || 0;
    }

    async clearOfUser(slug: string, user_name: string): Promise<number> {
        const targetMessages = await this.messageRepository.find({ 
            slug, 
            author: user_name
        });

        await this.deleteAtachmentsOfMessages(targetMessages);

        const deletionResult = await this.messageRepository.deleteMany({ 
            slug, 
            author: user_name
        });

        return deletionResult?.deletedCount || 0;
    }

    private async deleteAtachmentsOfMessages(messages: Message[]) {
        const attachmentIds: string[] = [];

        for(const i in messages) {
            if(messages[i].attachment)
                attachmentIds.push(messages[i]._id);
        }

        await Promise.all(attachmentIds.map(((id: string) => {
            return this.eraseAttachmentOfMessage(id);
        }).bind(this)));
    }
}