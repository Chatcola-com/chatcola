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
import mongoose, { Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

import Message, { TMessage } from "../../../../application/entities/message";

type IMessageDocument = TMessage & mongoose.Document;

const messageSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, auto: false, required: true },
    slug: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
}, {
    timestamps: true
});


messageSchema.plugin(uniqueValidator);
  
export const model = mongoose.model<IMessageDocument>('message', messageSchema);

interface TSerializedMessage extends Omit<TMessage, "_id"> {
    _id: mongoose.Types.ObjectId
}

export function serialize(message: Message): TSerializedMessage {
    return {
        ...message,
        _id: mongoose.Types.ObjectId(message._id)
    }
}

export function deserialize(message: TSerializedMessage): Message {
    return new Message({
        ...message,
        _id: message._id.toHexString()
    })
}