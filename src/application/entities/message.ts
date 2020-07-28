/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import mongoose from "mongoose";

import * as zod from "zod";

const messageSchema = zod.object({
    _id: zod.string(),
    slug: zod.string(),
    author: zod.string(),
    content: zod.string()
})

export type TMessage = zod.infer<typeof messageSchema>;

export default class Message {

    public _id: string;
    public slug: string;
    public author: string;
    public content: string;
    
    constructor(details: TMessage) {
        this._id = details._id;
        this.slug = details.slug;
        this.author = details.author;
        this.content = details.content;
    }

    static createNew(details: { slug: string; author: string; content: string }): Message {
        return new Message({
            ...details,
            _id: new mongoose.Types.ObjectId().toString()
        });
    } 
}