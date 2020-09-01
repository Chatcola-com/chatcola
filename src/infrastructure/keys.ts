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
import crypto from "crypto";

import { IKeyService, TKeyValueStore } from "../types/infrastructure";
import { sleep } from "./utils";

const PRIVATE_KEY_KEY = "CHATCOLA_SERVER_PRIVATE_KEY";
const PUBLIC_KEY_KEY = "CHATCOLA_SERVER_PUBLIC_KEY";

export default class KeyService implements IKeyService {
    
    constructor(
        private keyValueStore: TKeyValueStore,
    ) {};

    async init(): Promise<void> {
        const retrievedPublicKey = this.keyValueStore.getItem(PUBLIC_KEY_KEY);
        const retrievedPrivateKey = this.keyValueStore.getItem(PRIVATE_KEY_KEY);

        // Note that this is a heuristic check only. Later a node-forge isKeyValid version will be added
        if(
            ((typeof retrievedPublicKey) === "string" && retrievedPublicKey.length > 20) &&
            ((typeof retrievedPrivateKey) === "string" && retrievedPrivateKey.length > 20)
        )
            return;
        
        
        const { privateKey, publicKey } = await new Promise( (resolve, reject) => {
            crypto.generateKeyPair('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem'
                }
                }, (err, publicKey, privateKey) => {
                if(err) 
                    return reject(err);
                else
                    return resolve({
                        publicKey,
                        privateKey
                    })
            });
        });

        this.keyValueStore.setItem(PRIVATE_KEY_KEY, privateKey);
        this.keyValueStore.setItem(PUBLIC_KEY_KEY, publicKey);
    }

    getPublicKey() {
        const publicKey = this.keyValueStore.getItem(PUBLIC_KEY_KEY);

        if(!publicKey)
            throw new Error("Call KeyService.init() first before calling .getPublicKey()");

        return publicKey;
    }

    getMessageSignature(message: string) {
        
        const privateKey = this.keyValueStore.getItem(PRIVATE_KEY_KEY);

        if(!privateKey)
            throw new Error("Call KeyService.init() first before calling .getMessageSignature()");

        const sign = crypto.createSign('SHA256');
        sign.write(message);
        sign.end();
        return  sign.sign(privateKey, 'base64');
    }

    /**
     * DO NOT EVER REMOVE THIS METHOD. It is not used through the program, but is
     * an essential means of reference on how to verify the message on remote servers.
     * It is also tested, so if your test fails because of this method - it will fail in production.
    */
    verifyMessageSignature(signature: string, message: string): boolean {
        const verify = crypto.createVerify("SHA256");

        verify.write(message);
        verify.end();
        
        return verify.verify(
            this.getPublicKey(),
            signature,
            "base64"
        );
    }

}