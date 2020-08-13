/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
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
import { initJwtSecret, getPersistedInstanceAddress, persistInstanceAddress } from "./persistentConfig";
import { IKeyService } from "../types/infrastructure";

import getAlligatorWsConnector from "./alligatorWsConnector";

import readline from "readline-sync";

const jwtSecret = initJwtSecret(keyValueStore);
Container.set("jwtSecret", jwtSecret);

const persistedInstanceAddress = getPersistedInstanceAddress(keyValueStore);

if(!persistedInstanceAddress && !process.env.THIS_INSTANCE_ADDRESS) {
   
    const instanceAddress = readline.question("Please input instance address...\n--> ")
    const instanceAddressRepeat = readline.question("Please repeat the instance address...\n--> ");

    if(!instanceAddress || (instanceAddress !== instanceAddressRepeat))
        process.exit(1);

    persistInstanceAddress(keyValueStore, instanceAddress);
    Container.set("THIS_INSTANCE_ADDRESS", instanceAddress);
} 
else if(process.env.THIS_INSTANCE_ADDRESS) {
    persistInstanceAddress(keyValueStore, process.env.THIS_INSTANCE_ADDRESS);

    Logger.info(`Updating THIS_INSTANCE_ADDRESS to "${process.env.THIS_INSTANCE_ADDRESS}"`);
    Container.set("THIS_INSTANCE_ADDRESS", process.env.THIS_INSTANCE_ADDRESS);
}
else {
    Logger.info(`Using previous THIS_INSTANCE_ADDRESS "${persistedInstanceAddress}"`)
    Container.set("THIS_INSTANCE_ADDRESS", persistedInstanceAddress);
}

const THIS_INSTANCE_ADDRESS = Container.get<string>("THIS_INSTANCE_ADDRESS");

Container.set("logger", Logger);
Container.set("eventEmitter", eventEmitter);
Container.set("jobScheduler", jobScheduler);
Container.set("errorTracker", errorTracker);

Container.set("keyValueStore", keyValueStore);

Container.set("keyservice", new KeyService(keyValueStore));

Container.set("alligatorFetcher", alligatorFetcher(THIS_INSTANCE_ADDRESS));
Container.set("alligatorWsConnector", getAlligatorWsConnector(THIS_INSTANCE_ADDRESS))

const { 
    chatroomRepository,
    messageRepository,
    initDatabase
} = resolveDatabase(config.database);

Container.set("chatroomRepository", chatroomRepository);
Container.set("messageRepository", messageRepository);

Logger.info(`Successfuly initialized dependencies`);

export default async function loadInfrastructure() {
    
    const keyService = Container.get<IKeyService>("keyservice")

    await keyService.init();
    Logger.info(`Successfuly initialized keys!`);

    await initDatabase();
    Logger.info(`Successfuly connected to the database!`)
}