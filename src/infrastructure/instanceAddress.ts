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
import { TKeyValueStore } from "../types/infrastructure";
import { getPersistedInstanceAddress, persistInstanceAddress } from "./persistentConfig";

import readline from "readline-sync";

import config from "./config";

//@ts-ignore
import syncFetch from "sync-fetch";

export default function resolveInstanceAddress(keyValueStore: TKeyValueStore): string {

    const persistedInstanceAddress = getPersistedInstanceAddress(keyValueStore);

    const wantsToReset = process.argv.includes("--resetAddress");

    if(wantsToReset || !persistedInstanceAddress) {
        const instanceAddress = askForInstanceAddress();

        persistInstanceAddress(keyValueStore, instanceAddress);

        return instanceAddress;
    }
    else {
        return persistedInstanceAddress;
    }
}

function askForInstanceAddress(): string {
    
    
    while(true) {
        const instanceAddress = readline.question("Please input instance address...\n--> ");

        console.log(`Checking if address "${instanceAddress}" is available... `)
        const isItAvailable = isInstanceAddressAvailable(instanceAddress);

        if(!isItAvailable) {
            console.log(`Instance address ${instanceAddress} is already taken, please try a different one.\n`);
            continue;
        }
        
        console.log(`It's available!`);

        const hasConfirmed = 
            readline.question(`Are you sure you want to use instance address "${instanceAddress}" ? (Y/n)`);

        if( hasConfirmed?.toLowerCase() === "n" )
            continue;

        return instanceAddress;
    }
    
}

function isInstanceAddressAvailable(instanceAddress: string): boolean {

    if( !config.isProd )
        return true;
    
    const result = syncFetch(`https://${config.alligator_url}/api/chatcolaInstance/isInstanceAddressAvailable`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            instanceAddress
        })
    }).json();

    if(result.error)
        throw new Error(`While checking if instanceAddress is available within alligator: ${JSON.stringify(result)}`);


    return result?.data?.isItAvailable;
}