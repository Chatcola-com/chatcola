import router from "../../application/socket/router";

export default function bootstrapChatroomSocketDataChannel(channel: RTCDataChannel) {

    channel.onmessage = (e) => {
        const message = JSON.parse(e.data.toString());

        const result = router(
            message,
            //@ts-ignore
            channel.locals
        )

        if(!result)
            return;

        if(result.broadcast)
            channel.send(JSON.stringify(result.body));
        else
            channel.send(JSON.stringify(result.body));
    }
}