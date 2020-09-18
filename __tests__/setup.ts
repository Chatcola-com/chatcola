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
import { EventEmitter } from "events";

import resolveDatabase from "../src/infrastructure/db";
import { IFileService } from "../src/types/infrastructure";

Container.set("eventEmitter", new EventEmitter());

Container.set("errorTracker", {
    submit: jest.fn()
})

Container.set("THIS_INSTANCE_ADDRESS", "dummyhost:202020");

Container.set("keyservice", {
    getMessageSignature: jest.fn(() => "signature"),
    getPublicKey: jest.fn(() => "publickey"),
    verifyMessageSignature: jest.fn(signature => signature === "signature"),
    init: jest.fn()
})

Container.set("jwtSecret", "hehehe");

Container.set("logger", {
    info: console.log,
    error: console.error,
    warn: console.warn
});

const fakeFileSystemXD: {
    [filename: string]: string
} = {};

const fakeFileService: IFileService = {
    async writeFile(namespace, name, content) {
        fakeFileSystemXD[`${namespace}-${name}`] = content;
    },
    async readFile(namespace, name) {
        return fakeFileSystemXD[`${namespace}-${name}`];
    },
    async eraseFile(namespace, name) {
        delete fakeFileSystemXD[`${namespace}-${name}`];
    }
}


Container.set("fileService", fakeFileService)

Container.set("alligatorFetcher", jest.fn(() => ({ success: true })));

const { 
    chatroomRepository,
    messageRepository
} = resolveDatabase("nedb");

Container.set("messageRepository", messageRepository);
Container.set("chatroomRepository", chatroomRepository)

