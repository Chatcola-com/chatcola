/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { WebSocket } from "uWebSockets.js";
import { EventEmitter } from "events";

import { Container } from "typedi";

import events from "../../events/events";
import { TLogger } from "types/infrastructure";

const emitter = Container.get<EventEmitter>("eventEmitter");
const Logger = Container.get<TLogger>("logger");

export const open = (ws: WebSocket): void | WebSocket => {

    ws.subscribe( ws.locals.slug );

    emitter.emit(events.NEW_CLIENT_CONNECTED, ws);
}

export const close = (ws: WebSocket, code: number, message: ArrayBuffer) => {
    ws["closed"] = true;

    Logger.info(`websocket disconnected: name: "${ws.locals?.name}", code: ${code}   `)

    emitter.emit(events.CLIENT_DISCONNECTED, ws);
}