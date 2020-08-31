import { Container } from "typedi";

import infraConfig from "./config";
import { 
    TLogger, 
    TAlligatorWsConnector, 
    TMessageToAlligator,
    messageFromAlligatorSchema,
    TMessageFromAlligator
} from "../types/infrastructure";

import https from "https";
import WebSocket from "ws";

import { v4 as uuidv4 } from "uuid";

import KeyService from "../infrastructure/keys";

let alligatorConection: null | WebSocket;

type TAlligatorMessageHandler = (message: TMessageFromAlligator, send: (message: TMessageToAlligator) => any) => any;

const topicHandlers: {
    [topicId: string]: TAlligatorMessageHandler;
} = {};

const typeHandlers: {
    [type: string]: TAlligatorMessageHandler;
} = {};

function makeSendToAlligator(topicId: string) {
    return async function sendToAlligator(message: TMessageToAlligator) {
        await waitForConnection();

        alligatorConection?.send(JSON.stringify({
            ...message,
            topicId
        }))
    } 
}

function bootstrapAlligatorWsConnection() {

    setInterval(() => {
        try {
            alligatorConection?.ping("{}", undefined, () => {});
        } catch {}
    }, 5000);

    alligatorConection?.on("message", function(data) {

        try {
            messageFromAlligatorSchema.parse(JSON.parse(data.toString()));
        } catch (error) {
            return console.error(`Failed to parse message from alligator: `, error, data.toString());
        }

        const message = 
            messageFromAlligatorSchema.parse( JSON.parse(data.toString()) );

        if(
            (typeof topicHandlers[message.topicId]) === "function"
        )
            topicHandlers[message.topicId](message, makeSendToAlligator(message.topicId));

        if(
            (typeof typeHandlers[message.type] === "function")
        )
            typeHandlers[message.type](message, makeSendToAlligator(message.topicId));
    });
};

export default function getAlligatorWsConnector(THIS_INSTANCE_ADDRESS: string, ): TAlligatorWsConnector {

    connectToAlligator(THIS_INSTANCE_ADDRESS);

    return {
        startTopic() {
            const topicId = uuidv4();

            return {
                async send(message: TMessageToAlligator) {
    
                    const stringifiedMessage = JSON.stringify({
                        topicId,
                        ...message
                    });
                    
                    await waitForConnection();

                    alligatorConection?.send?.(stringifiedMessage);
                },
                unsubscribe() {
                    delete topicHandlers[topicId];
                },
                handleMessage(handler: TAlligatorMessageHandler) {
                    topicHandlers[topicId] = handler;
                }
            }
        },
        subscribe(type, handler) {
            typeHandlers[type] = handler;

            return {
                unSubscribe() {
                    delete typeHandlers[type];
                }
            }
        }
    }
}

async function connectToAlligator(THIS_INSTANCE_ADDRESS: string): Promise<void> {

    const Logger = Container.get<TLogger>("logger");

    const keyService = Container.get<KeyService>("keyservice");
    
    const agent = new https.Agent({
        rejectUnauthorized: process.env.NODE_ENV?.toLowerCase?.() !== "development"
    });
    
    return new Promise( (r) => {

        const signedTimestamp = Date.now().toString()
        const timestampSignature = keyService.getMessageSignature(`${THIS_INSTANCE_ADDRESS}-${signedTimestamp}`)

        const ws = new WebSocket(`wss://${infraConfig.alligator_url}/s/chatcolaInstance`, {
            agent,
            headers: {
                "x-timestamp-signature": `${THIS_INSTANCE_ADDRESS} ${signedTimestamp} ${timestampSignature}`,
            }
        })
        
        const onHangup = () => {
            alligatorConection = null;
            retryConectingToTheAlligator(THIS_INSTANCE_ADDRESS);
            r();
        }

        ws.on("close", onHangup);
        ws.on('error', onHangup)

        ws.on("open", () => {
            Logger.info(`Successfuly connected to the alligator!`);
            alligatorConection = ws;
            bootstrapAlligatorWsConnection();
            r();
        })
    })
}

let isRetryRunning = false;

function retryConectingToTheAlligator(THIS_INSTANCE_ADDRESS: string) {

    const Logger = Container.get<TLogger>("logger");

    if(alligatorConection || isRetryRunning)
        return;

    isRetryRunning = true;
    
    const interval = setInterval( async () => {

        Logger.error(`The alligator hung up! Retrying in 5 seconds...`)

        await connectToAlligator(THIS_INSTANCE_ADDRESS);

        if( alligatorConection ) {
            clearInterval(interval);

            isRetryRunning = false;
            return;
        } 
    }, 5000);
}

async function waitForConnection() {
    return new Promise( (r) => {

        if(alligatorConection)
            r();

        setInterval(() => {
            if(alligatorConection)
                r();
        }, 500);
    });
}