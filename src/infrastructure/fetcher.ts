/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { Container } from "typedi";

import fetch, { RequestInit } from "node-fetch";

import https from "https";

import config from "./config";
import { TFetcher, IKeyService } from "../types/infrastructure";

const agent = new https.Agent({
    rejectUnauthorized: process.env.NODE_ENV?.toLowerCase?.() !== "development"
})  

export const alligatorFetcher: TFetcher = 
async (path: string, options: RequestInit = {}) => {

    const keyService = Container.get<IKeyService>("keyservice");

    let signature = "";

    if(options?.body && (typeof options?.body) === "string") 
        signature = keyService.getMessageSignature(String(options.body));

    return fetch(`${config.delegator_url}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Signature ${config.this_instance_address} ${signature}`,
            ...options?.headers
        },  
        agent,
        ...options
    })
    .then(res => res.json())
    .catch(err => ({ success: false, error: err }));
}