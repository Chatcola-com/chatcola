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
import KeyService from "../src/infrastructure/keys";

const store: {[key: string]: any} = {};

const inMemoryKeyStore = {
    store,
    incrementChatroomCount() {},
    setItem(key: string, val: any): any { this.store[key] = val;  },
    getItem(key: string): any { return this.store[key]; }
}

const keyService = new KeyService(
    inMemoryKeyStore
);

describe("Key service", () => {

    beforeAll(async () => {
        await keyService.init();
    });

    it("Should have and provide a public key", async () => {
        expect(
            keyService.getPublicKey()
        ).toBeTruthy();

        expect(
            (typeof keyService.getPublicKey())
        ).toEqual("string");
    });

    describe("Signing messages", () => {

        it("Should provide a message signature", () => {

            const dataToBeSigned = "sjefhjiudngfujndfg";
    
            expect(
                keyService.getMessageSignature(dataToBeSigned)
            ).toBeTruthy();
    
            expect(
                (typeof keyService.getMessageSignature(dataToBeSigned))
            ).toEqual("string");
        });

        it("Should verify it's own signature as correct", () => {
            const dataToBeSigned = `Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum`;

            const signature = keyService.getMessageSignature(dataToBeSigned);

            const isSignatureValid = keyService.verifyMessageSignature(
                signature,
                dataToBeSigned
            );

            expect(isSignatureValid);
        })

        it("Should NOT verify it's own signature as correct", () => {
            const dataToBeSigned = `Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum`;

            const isSignatureValid = keyService.verifyMessageSignature(
                "123",
                dataToBeSigned
            );

            expect(isSignatureValid).toEqual(false);
        })

    })
    
});