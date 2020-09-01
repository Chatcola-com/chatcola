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