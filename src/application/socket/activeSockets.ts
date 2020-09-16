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
export type TChatroomSocket = {
    locals: {
        slug: string;
        name: string;
        isInCall: boolean;
    }
    send: (message: {[key: string]: any}) => any;
    close: () => any;   
    isOpen: () => boolean;
}

export default class ActiveSocketsManager {

    private activeSockets: {
        [slug: string]: TChatroomSocket[]
    } = {};


    socketJoined(socket: TChatroomSocket) {
        const { slug } = socket.locals;

        if(!this.activeSockets[slug])  
                this.activeSockets[slug] = [];

        this.activeSockets[slug].push(socket);   

        socket.send({
            type: "whoami",
            data: { 
                name: socket.locals.name
            }
        });

        this.publishToChatroom(
            socket.locals.slug,
            {
                type: "user_joined",
                data: {
                    user_name: socket.locals.name
                }
            }
        );

        const activeChatroomUsers = 
            this.activeSockets[slug];

        const active_users = activeChatroomUsers?.map(s => s.locals.name);
        const users_in_call = activeChatroomUsers?.filter(s => s.locals.isInCall).map(s => s.locals.name);

        socket.send({
            type: "active_users",
            data: { 
                active_users,
                users_in_call
            }
        });
    }

    socketLeft(socket: TChatroomSocket) {
        const { slug } = socket.locals;

        if(!this.activeSockets[slug])
                return;

        this.activeSockets[slug] = 
            this.activeSockets[slug].filter( client => client !== socket );


        this.publishToChatroom(
            socket.locals.slug,
            {
                type: "user_left",
                data: {
                    user_name: socket.locals.name
                }
            }
        )
    }

    publishToChatroom(slug: string, message: {[key: string]: any}) {
        this.activeSockets[slug]?.forEach( socket => {
            if(socket.isOpen())
                socket.send(message);
        })
    }

    getSocketOfUser(slug: string, username: string): TChatroomSocket | undefined {
        return this.activeSockets[slug]?.find(socket => socket.locals.name === username);
    }
}