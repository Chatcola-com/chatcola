/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { Container } from "typedi";

process.env.CHATCOLA_DRIVER = "http";

import { TLogger } from "../../types/infrastructure";

import bootstrapApp from "../../index";
import bootstrapWebserver from "./server";
import bootstrapWebEvents from "./events/index";

import config from "./config";

import AlligatorService from "../../application/alligator.service";

const alligatorService = Container.get(AlligatorService);

(async () => {

  await bootstrapApp();

  const Logger = Container.get<TLogger>("logger");

  const webserver = await bootstrapWebserver(config.port);

  Container.set("webserver", webserver);

  await alligatorService.sayHello()
    .then(() => Logger.info(`Successfuly connected to Alligator`))
    .catch((error: any) => Logger.error(error, `Failed connect to Alligator`))


  bootstrapWebEvents();

  Logger.info(`Started webserver on localhost:${config.port}`)

})()