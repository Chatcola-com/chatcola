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

import fetch, { RequestInit } from "node-fetch";

import https from "https";

import config from "./config";
import { TFetcher, IKeyService } from "../types/infrastructure";

const agent = new https.Agent({
    rejectUnauthorized: process.env.NODE_ENV?.toLowerCase?.() !== "development"
});


export function alligatorFetcher(THIS_INSTANCE_ADDRESS: string): TFetcher {
    return async (path: string, options: RequestInit = {}) => {

        const keyService = Container.get<IKeyService>("keyservice");
    
        let signature = "";
    
        if(options?.body && (typeof options?.body) === "string") 
            signature = keyService.getMessageSignature(String(options.body));
    
        return fetch(`https://${config.alligator_url}${path}`, {
            headers: {
                "Content-type": "application/json",
                "Authorization": `Signature ${THIS_INSTANCE_ADDRESS} ${signature}`,
                ...options?.headers
            },  
            agent,
            ...options
        }).then(res => res.json())
        .catch(err => ({ success: false, error: err }));
    }
}