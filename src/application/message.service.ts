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
import  { Service, Inject } from "typedi";


import Message, { TMessage } from "./entities/message";
import { TMessageRepository } from "../types/infrastructure";

@Service()
export default class MessageService {

    constructor(
        @Inject("messageRepository") private messageRepository: TMessageRepository
    ) {};

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
    }}) {
        const message = Message.createNew(details);
        
        await this.messageRepository.save(message);
        
        return message;
    }

    async clearStale (): Promise<void> {
        const yesterdayThisTime = new Date( Date.now() );
        yesterdayThisTime.setDate( yesterdayThisTime.getDate() - 1 );
        
        await this.messageRepository.deleteMany({
            createdAt: {
                $lte: yesterdayThisTime
            }
        })
    }

    async clearAll (slug: string): Promise<number> {
        const result = await this.messageRepository.deleteMany({ slug });
    
        return result?.deletedCount || 0;
    }

    async clearOfUser(slug: string, user_name: string): Promise<number> {
        const result = await this.messageRepository.deleteMany({ 
            slug, 
            author: user_name
        });
    
        return result?.deletedCount || 0;
    }
}