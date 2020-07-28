/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { MakeWsCarousel } from "karuzela";

import * as Controller from "./reducer";

import { Container } from "typedi";
import { TLogger } from "types/infrastructure";

const Logger = Container.get<TLogger>("logger");

export default MakeWsCarousel({
  eventHandlers: {
    "stop_typing": Controller.stop_typing,
    "start_typing": Controller.start_typing,
    "message": Controller.message,
    "whoami": Controller.whoami,
    "ping": Controller.ping
  },
  fallback: (ws, message) => {
    Logger.error(`ws fallback, event: ${message}`)
  },
  errorHandler: (err, ws, message, isBinary) => {
    Logger.error(err);
  }
})
