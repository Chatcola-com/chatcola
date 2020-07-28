/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import uWS from "uWebSockets.js";

import ms from "ms";

import { open, message, close, upgrade } from "./controllers";


export default (app: uWS.TemplatedApp) => {

    app.ws('/s/:chatUserToken', {
        
        compression: 0,
        maxPayloadLength: 16 * 1024 * 1024,
        idleTimeout: ms("1 hour") * 1000,
        
        upgrade,
        open,
        message,
        close
    });

}