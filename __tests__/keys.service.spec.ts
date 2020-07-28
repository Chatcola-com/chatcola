/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import KeyService from "../src/infrastructure/keys";

const inMemoryKeyStore = {
    store: {},
    incrementChatroomCount() {},
    setItem(key: string, val: any) { this.store[key] = val;  },
    getItem(key: string) { return this.store[key]; }
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