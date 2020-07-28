import { TKeyValueStore } from "types/infrastructure";

import crypto from "crypto";

const JWT_SECRET_KEY = "JWT_SECRET";

export default function initJwtSecret(keyValueStore: TKeyValueStore): string {

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