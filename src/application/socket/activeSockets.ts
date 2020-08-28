export type TChatroomSocket = {
    locals: {
        slug: string;
        name: string;
    }
    send: (message: string) => any;
    close: () => any;   
    isOpen: () => boolean;
}

export const activeSockets: {
    [slug: string]: TChatroomSocket[]
} = {};

export function publishToChatroom(slug: string, message: string) {
    activeSockets[slug]?.forEach( socket => {
        if(socket.isOpen())
            socket.send(message);
    })
}