import router from "../src/application/resources/router";

const sampleChatroom = {
    access_tokens_amount: 0,
    max_users: 10,
    name: "|1232",
    valid_until: Date.now() + 345356456,
}

describe("Resources router", () => {

    describe("Workflows", () => {

        it("Should let you create a chatroom, get an admin token using sent credentials and fetch detailed chatroom data", async () => {
            const creationResult = await router(
                `/api/chatroom/create`,
                {
                    ...sampleChatroom,
                    auth_type: "none",
                    access_tokens_amount: 0
                },
                {}
            )

            expect(creationResult.success).toEqual(true);

            expect(creationResult.data?.chatroom).toBeTruthy();

            const {access_tokens_amount, ...restOfSamplechatroom} = sampleChatroom;
            expect(creationResult.data?.chatroom).toMatchObject(restOfSamplechatroom);

            const { chatroom } = creationResult.data;

            const adminTokenResult = await router(
                `/api/auth/admin`,
                {
                    slug: chatroom.slug,
                    admin_slug: chatroom.admin_slug,
                    admin_password: chatroom.admin_password
                },
                {}
            );

            expect(adminTokenResult.success);

            const { admin_token } = adminTokenResult.data;

            expect(typeof admin_token).toEqual("string");
            expect(admin_token).not.toEqual("");

            const detailedChatroomResult = await router(
                `/api/chatroom/detailed`,
                {},
                {
                    tokenType: "admin",
                    token: admin_token
                }
            );

            expect(detailedChatroomResult.success);
        
            expect(detailedChatroomResult.data?.chatroom).toBeTruthy();

            expect(Object.keys(detailedChatroomResult.data?.chatroom)).toEqual(
                expect.arrayContaining(["name", "banned_users", "auth_type", "users", "access_tokens"])
            )
        });

        

    })

})