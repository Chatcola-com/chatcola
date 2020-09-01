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