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
import jwt from "jsonwebtoken";

import { Container, Service, Inject } from "typedi";
import { TUserCredentials, TAdminCredentials, ITokenClaims, TUserTokenClaims, TAdminTokenClaims } from "../types/auth";
import { AppError } from "../infrastructure/utils";

import { TChatroomRepository } from "../types/infrastructure";

@Service()
export default class AuthService {

    constructor(
        @Inject("chatroomRepository") private chatroomRepository: TChatroomRepository
    ) {};

    async login({ slug, ...credentials }: TUserCredentials) {

        const chatroom = await this.chatroomRepository.findBySlug(slug);

        if(!chatroom) 
            throw new AppError("Not found");
    
        if( chatroom.checkPresenceOfUser(credentials.name) )
            throw new AppError("Username taken");
        
        if(credentials.admin_token) {
            const { type } = verifyToken(credentials.admin_token);

            if(type !== "admin")
                throw new AppError("Bad credentials");
        }
        else if(!chatroom?.authenticate(credentials) )
            throw new AppError("Bad credentials");

        if( !chatroom.registerUser(credentials) )
            throw new AppError("Chatroom full");

        await this.chatroomRepository.persist(chatroom);

        return await signToken({ 
            slug, 
            name: "@"+credentials.name,
            type: "user" 
        }); 
    }

    async leave(slug: string, user_name: string) {
        const chatroom = await this.chatroomRepository.findBySlug(slug);

        if(!chatroom)
            return;

        chatroom.removeUser(user_name);

        await this.chatroomRepository.persist(chatroom);
    }

    async adminLogin(credentials: TAdminCredentials) {
        const chatroom = await this.chatroomRepository.findOne({ admin_slug: credentials.admin_slug });

        if( !chatroom?.adminAuthenticate(credentials) )
            throw new AppError("Unauthorized");
        
        return await signToken( { slug: chatroom.slug, type: "admin" } );
    }

    async validateChatUserToken(token: string): Promise<TUserTokenClaims> {
        const claims = await this.validateChatToken(token);

        if(claims.type !== "user")
            throw new AppError("Unauthorized");

        return claims;
    }

    async validateChatAdminToken(token: string): Promise<TAdminTokenClaims> {
        const claims = await this.validateChatToken(token);

        if(claims.type !== "admin")
            throw new AppError("Unauthorized");

        return claims;
    }

    async validateChatToken(token: string): Promise<ITokenClaims> {
        const claims = verifyToken(token);

        if(claims.type === "admin")
            return claims;

        const chatroom = await this.chatroomRepository.findBySlug(claims.slug);

        if(!chatroom)
            throw new AppError("Not found");
        
        if( chatroom.isUserBanned(claims.name) )
            throw new AppError(`Banned`);

        return claims;
    }

    async getPushSubscriptionToken (subscriptionId: string): Promise<string> {
        const payload = {
            subscriptionId
        };
    
        return await signToken(payload);
    }

    async validatePushSubscriptionToken (token: string): Promise<any> {
        try {
            const claims = verifyToken(token);
    
            return claims;
        }
        catch(err) {
            throw new AppError("Unauthorized");
        }
    }
}

/**
 * --------------------------------<-utility functions, might migrate to separate infrastructure service later->--------------------------------------
 */


const verifyToken = (token: string): any => {
    const jwtSecret = Container.get<string>("jwtSecret");

    try {
        const claims: any = jwt.verify(token, jwtSecret);

        return claims;
    }
    catch(error) {
        throw new AppError(`Unauthorized`);
    }
}

const signToken = (claims: { [key: string]: any }): Promise<string> => {
    const jwtSecret = Container.get<string>("jwtSecret");

    return new Promise<string>( (resolve, reject) => {
        jwt.sign( claims , jwtSecret, function(err: any, token: any) {
            if(err)
                reject(err);
            else
                resolve(token);
        });
    })
}