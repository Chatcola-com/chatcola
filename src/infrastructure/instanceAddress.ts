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
        body: JSON.stringify({
            instanceAddress
        })
    }).json();

    if(result.error)
        throw new Error(`While checking if instanceAddress is available within alligator: ${JSON.stringify(result)}`);


    return result?.data?.isItAvailable;
}