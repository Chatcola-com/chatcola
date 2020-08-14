import "reflect-metadata";

import { Container } from "typedi";
import { EventEmitter } from "events";

import resolveDatabase from "../src/infrastructure/db";

Container.set("eventEmitter", new EventEmitter());

Container.set("errorTracker", {
    submit: jest.fn()
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

