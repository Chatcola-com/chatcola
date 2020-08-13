/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { Container } from "typedi";

process.env.CHATCOLA_DRIVER = "webrtc";

import { TLogger } from "../../types/infrastructure";

import bootstrapApp from "../../index";

import bootstrapP2PServer from "./server";
import AlligatorService from "../../application/alligator.service";

const alligatorService = Container.get(AlligatorService);

(async () => {

    await bootstrapApp();

    const Logger = Container.get<TLogger>("logger");

    await alligatorService.sayHelloP2p();
    Logger.info(`Successfuly negotiated keys with alligator!`);

    const webserver = await bootstrapP2PServer();

    Container.set("webserver", webserver);
    
    Logger.info(`Started webserver on localhost`);
})()