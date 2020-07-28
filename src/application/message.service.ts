/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
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

    async new (details: {slug: string; author: string; content: string}) {
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