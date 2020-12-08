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
/** / 
 * /------------------------------------------
 */

import Chatroom from "application/entities/chatroom";
import Message from "application/entities/message";

import * as zod from "zod";

export type TLogger = {
    info: TLogFunction;
    error: TLogFunction;
}

type TLogFunction = (message: string, ...meta: Array<any>) => any;


/** / 
 * /------------------------------------------
*/

export interface IFileService {
    init: () => any;
    readFile: (namespace: string, name: string) => Promise<string | null>;
    writeFile: (namespace: string, path: string, content: string) => Promise<void>;
    eraseFile: (namespace: string, name: string) => Promise<void>;
}

/** / 
 * /------------------------------------------
*/


export type TJobScheduler = {
    schedule: (cronString: string, fn: () => any) => any;
}

/** / 
 * /------------------------------------------
 */

export type TFetcher = (path: string, options?: any) => Promise<any>;

/** / 
 * /------------------------------------------
 */

export type TCreateBackup = (backupName: string) => any;

/** / 
 * /------------------------------------------
*/

export const messageFromAlligatorSchema = zod.intersection(
    zod.object({
        topicId: zod.string()
    }).nonstrict(),
    zod.union([
        zod.object({
            type: zod.literal("webrtcoffer"),
            data: zod.object({
                webrtcoffer: zod.string()
            })
        }).nonstrict(),
        zod.object({
            type: zod.literal("icecandidate"),
            data: zod.object({
                icecandidate: zod.string()
            })
        }).nonstrict()
    ])
)

export const messageToAlligatorSchema = zod.union([
        zod.object({
            type: zod.literal("webrtcanswer"),
            data: zod.object({
                webrtcanswer: zod.string()
            })
        }).nonstrict(),
        zod.object({
            type: zod.literal("icecandidate"),
            data: zod.object({
                icecandidate: zod.string()
            })
        }).nonstrict(),
    ])


export type TMessageToAlligator = zod.infer< typeof messageToAlligatorSchema >;
export type TMessageFromAlligator = zod.infer< typeof messageFromAlligatorSchema >;

export type TAlligatorWsConnector = {
    startTopic: () => {
        send: (message: TMessageToAlligator) => any;
        unsubscribe: () => any;
        handleMessage: ( callback: (message: TMessageFromAlligator) => any ) => any;
    },
    subscribe: (type: string, handler: (message: TMessageFromAlligator, send: (message: TMessageToAlligator) => any) => any) => {
        unSubscribe: () => any;
    };
}

/** / 
 * /------------------------------------------
 */

export interface IKeyService {

    init: () => Promise<void>;

    getMessageSignature: (message: string) => string;
    getPublicKey: () => string; 
}

/** / 
 * /------------------------------------------
 */

export type TKeyValueStore = {
    getItem: (key: string) => any;
    setItem: (key: string, value: any) => void;
}

export interface IEntityRepository<TEntity> {
    find: (predicates: any) => Promise< Array<TEntity> >;
    findOne: (predicates: any) => Promise<TEntity | null>;
    findByIds: (ids: Array<string>) => Promise<Array<TEntity>>;

    deleteMany: (predicates: any) => Promise<{ deletedCount?: number }>;
    deleteOne: (predicates: any) => Promise<void>;
 
    save: (instance: TEntity) => Promise<void>;
    persist: (instance: TEntity) => Promise<void>;
}

export interface TChatroomRepository extends IEntityRepository<Chatroom> {
    findBySlug: (slug: string) => Promise<Chatroom | null>;
};
export type TMessageRepository = IEntityRepository<Message>;
