/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
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