/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import crypto from "crypto";

import { IKeyService, TKeyValueStore } from "../types/infrastructure";

const PRIVATE_KEY_KEY = "CHATCOLA_SERVER_PRIVATE_KEY";
const PUBLIC_KEY_KEY = "CHATCOLA_SERVER_PUBLIC_KEY";

export default class KeyService implements IKeyService {
    
    constructor(
        private keyValueStore: TKeyValueStore,
    ) {};

    async init(): Promise<void> {
    
            const retrievedPublicKey = this.keyValueStore.getItem(PUBLIC_KEY_KEY);
            const retrievedPrivateKey = this.keyValueStore.getItem(PRIVATE_KEY_KEY);

            // Note that this is a heuristic check only. Later a node-forge version will be added
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
            })

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