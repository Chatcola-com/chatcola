/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
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