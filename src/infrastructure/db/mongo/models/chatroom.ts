/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import uniqueValidator from "mongoose-unique-validator";

import { TChatroom } from "../../../../application/entities/chatroom";
import Chatroom from "../../../../application/entities/chatroom";

const chatroomSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true, index: true, default: uuidv4 },
    valid_until: { type: Number, required: true },
    max_users: { type: Number, required: true },

    free_access_tokens: [ String ],

    auth_type: {
        type: String,
        required: true
    },

    users: {
        type: [
            { name: String, access_token: String, subscription_id: { type: Schema.Types.ObjectId, auto: false } }
        ],
        default: []
    },

    banned_users: {
        type: [String],
        default: []
    },
    
    admin_slug: { type: String, default: uuidv4 },
    admin_password: { type: String, default: () => Math.random().toString(36).substring(2, 8) },
});

chatroomSchema.plugin(uniqueValidator);



interface TSerializedChatroom extends Omit<TChatroom, "_id"> {
    _id: mongoose.Types.ObjectId
}

export const model = mongoose.model<TSerializedChatroom & mongoose.Document>('chatroom', chatroomSchema);

export function serialize(chatroom: Chatroom): TSerializedChatroom {
    return {
        ...chatroom,
        _id: mongoose.Types.ObjectId(chatroom._id)
    }
}

export function deserialize(chatroom: TSerializedChatroom): Chatroom {
    return new Chatroom({
        ...chatroom,
        _id: chatroom._id.toHexString()
    })
}