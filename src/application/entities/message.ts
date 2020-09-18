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
import mongoose from "mongoose";

import * as zod from "zod";

const messageSchema = zod.object({
    _id: zod.string(),
    slug: zod.string(),
    author: zod.string(),
    content: zod.string(),

    attachmentName: zod.string().nonempty().optional().nullable()
})

export type TMessage = zod.infer<typeof messageSchema>;

export default class Message {

    public _id: string;
    public slug: string;
    public author: string;
    public content: string;
    public attachmentName?: string | null;
    
    constructor(details: TMessage) {
        this._id = details._id;
        this.slug = details.slug;
        this.author = details.author;
        this.content = details.content;
        this.attachmentName = details.attachmentName;
    }

    static createNew(details: { slug: string; author: string; content: string, attachmentName?: string | null }): Message {
        return new Message({
            ...details,
            _id: new mongoose.Types.ObjectId().toString()
        });
    } 
}