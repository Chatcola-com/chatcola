/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
/** / 
 * /------------------------------------------
 */

import WebSocket from "ws";

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

export type TErrorTracker = {
    submit: (err: any) => Promise<void>;
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
