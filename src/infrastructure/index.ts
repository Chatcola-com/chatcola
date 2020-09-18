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
import "reflect-metadata";
import { Container } from "typedi";

import config from "./config";

import Logger from "./logs/logger";
import eventEmitter from "./emitter";
import jobScheduler from "./jobs";
import errorTracker from "./logs/sentry";

import { alligatorFetcher } from "./fetcher";

import keyValueStore from "./db/keyValue";

import resolveDatabase from "./db";
import KeyService from "./keys";
import { initJwtSecret } from "./persistentConfig";
import { IKeyService } from "../types/infrastructure";

import getAlligatorWsConnector from "./alligatorWsConnector";

import resolveInstanceAddress from "./instanceAddress";
import runMigrations from "./migrations";
import fileService from "./filesystem";

const jwtSecret = initJwtSecret(keyValueStore);
Container.set("jwtSecret", jwtSecret);

const THIS_INSTANCE_ADDRESS = resolveInstanceAddress(keyValueStore);


Logger.info(`Using instanceAddress ${THIS_INSTANCE_ADDRESS}`)

Container.set("THIS_INSTANCE_ADDRESS", THIS_INSTANCE_ADDRESS);

Container.set("logger", Logger);
Container.set("eventEmitter", eventEmitter);
Container.set("jobScheduler", jobScheduler);
Container.set("errorTracker", errorTracker);

Container.set("fileService", fileService);
Container.set("keyValueStore", keyValueStore);

Container.set("keyservice", new KeyService(keyValueStore));

Container.set("alligatorFetcher", alligatorFetcher(THIS_INSTANCE_ADDRESS));

const { 
    chatroomRepository,
    messageRepository,
    initDatabase,
    createBackup
} = resolveDatabase(config.database);

Container.set("chatroomRepository", chatroomRepository);
Container.set("messageRepository", messageRepository);

Logger.info(`Successfuly initialized dependencies`);

export default async function loadInfrastructure() {

    runMigrations(createBackup);

    const keyService = Container.get<IKeyService>("keyservice");

    await keyService.init();
    Logger.info(`Successfuly initialized keys!`);

    Container.set("alligatorWsConnector", getAlligatorWsConnector(THIS_INSTANCE_ADDRESS))

    await initDatabase();
    Logger.info(`Successfuly connected to the database!`);
}