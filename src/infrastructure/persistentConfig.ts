import { TKeyValueStore } from "types/infrastructure";

import crypto from "crypto";

const JWT_SECRET_KEY = "JWT_SECRET";

export function initJwtSecret(keyValueStore: TKeyValueStore): string {

    const retrievedJwtSecret = keyValueStore.getItem(JWT_SECRET_KEY);

    if(
        (typeof retrievedJwtSecret) === "string" &&
        retrievedJwtSecret?.length === 256 
    ) 
        return retrievedJwtSecret;
    else {
        const newSecret = generateNewJwtSecret();

        keyValueStore.setItem(JWT_SECRET_KEY, newSecret);

        return newSecret;
    }

}

function generateNewJwtSecret(): string {
    const randomBytes = crypto.randomBytes(128);

    return randomBytes.toString("hex");
}

const PERSISTED_INSTANCE_ADDRESS_KEY = "PERSISTED_INSTANCE_ADDRESS";

export function getPersistedInstanceAddress(keyValueStore: TKeyValueStore): string | null {
    const persistedInstanceAddress = keyValueStore.getItem(PERSISTED_INSTANCE_ADDRESS_KEY);

    return persistedInstanceAddress;
}

export function persistInstanceAddress(keyValueStore: TKeyValueStore, instanceAddress: string) {
    keyValueStore.setItem(PERSISTED_INSTANCE_ADDRESS_KEY, instanceAddress);
}