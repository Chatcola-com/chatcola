import { TMessageFromPeer } from "types/chatroom";

export type TWebrtcController = (reqest: TMessageFromPeer, reply: (replyBody: {[key: string]: any}) => any) => any;