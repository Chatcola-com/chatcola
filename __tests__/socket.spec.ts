import router from "../src/application/socket/router";

const sampleContext = {
  name: "@andrzej",
  slug: "dddddddddddddddddddd",
};

describe("Socket router", () => {
  describe("Trivial messages", () => {
    it('Should return a "pong" on "ping"', () => {
      const response = router(
        {
          type: "ping",
          data: {},
        },
        sampleContext
      );

      expect(response).toBeTruthy();

      expect(response?.body).toEqual({ type: "pong", data: {} });
      expect(response?.broadcast).not.toBeTruthy();
    });

    it('Should return a broadcast "stop_typing" and "start_typing" on receiving such event', () => {
      const startTypingResponse = router(
        {
          type: "start_typing",
          data: {},
        },
        sampleContext
      );

      expect(startTypingResponse).toBeTruthy();

      expect(startTypingResponse?.body).toEqual({
        type: "start_typing",
        data: {
          userName: sampleContext.name,
        },
      });
      expect(startTypingResponse?.broadcast).toBeTruthy();

      const stopTypingResponse = router(
        {
          type: "stop_typing",
          data: {},
        },
        sampleContext
      );

      expect(stopTypingResponse).toBeTruthy();

      expect(stopTypingResponse?.body).toEqual({
        type: "stop_typing",
        data: {
          userName: sampleContext.name,
        },
      });
      expect(stopTypingResponse?.broadcast).toBeTruthy();
    });
  });

  describe('"message" event', () => {
    it("Should emit back the message", () => {
      const result = router(
        {
          type: "message",
          data: {
            content: "hehehe",
          },
        },
        sampleContext
      );

      expect(result).toBeTruthy();

      expect(result?.body).toMatchObject({
        type: "message",
        data: {
          message: {
            content: "hehehe",
            author: sampleContext.name,
          },
        },
      });

      expect(typeof result?.body?.data?.message?._id).toEqual("string");
      expect(result?.body?.data?.message?._id?.length).toBeGreaterThan(0);
    });
  });

  describe("Various", () => {
    it("Should throw an error when an unknown message type is passed", () => {
      expect(() =>
        router(
          {
            type: "dddddddddddddddd",
            data: {
              key: "value",
            },
          },
          sampleContext
        )
      ).toThrowError();
    });
  });
});
