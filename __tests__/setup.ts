import "reflect-metadata";

import { Container } from "typedi";
import { EventEmitter } from "events";

import resolveDatabase from "../src/infrastructure/db";
import KeyService from "../src/infrastructure/keys";

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

Container.set("alligatorFetcher", jest.fn(() => ({ success: true })));

const { 
    chatroomRepository,
    messageRepository
} = resolveDatabase("nedb");

Container.set("messageRepository", messageRepository);
Container.set("chatroomRepository", chatroomRepository)

