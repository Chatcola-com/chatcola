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
import { Container } from "typedi";

process.env.CHATCOLA_DRIVER = "http";

import { TLogger } from "../../types/infrastructure";

import bootstrapApp from "../../index";
import bootstrapWebserver from "./server";

import config from "./config";

import AlligatorService from "../../application/alligator.service";

const alligatorService = Container.get(AlligatorService);

(async () => {

  await bootstrapApp();

  const Logger = Container.get<TLogger>("logger");

  await bootstrapWebserver(config.port);

  await alligatorService.sayHello()
    .then(() => Logger.info(`Successfuly sent keys to Alligator`))
    .catch((error: any) => Logger.error(error, `Failed to send keys to Alligator`))

  Logger.info(`Started webserver on localhost:${config.port}`)

})()