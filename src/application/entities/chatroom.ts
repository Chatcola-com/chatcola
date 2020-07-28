/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import mongoose from 'mongoose';

import { v4 as uuidv4 } from "uuid";

import { TUserCredentials, TAdminCredentials } from "../../types/auth";

import * as zod from "zod";

const chatroomSchema = zod.object({
    _id: zod.string(),
    name: zod.string(),
    slug: zod.string(),
    auth_type: zod.enum(["none", "access_tokens"]),
    valid_until: zod.number(),
    max_users: zod.number(),
    users: zod.array(zod.object({
        name: zod.string().nonempty(),
        access_token: zod.string().optional(),
        subscription_id: zod.string().optional()
    })),
    free_access_tokens: zod.array(zod.string()),
    banned_users: zod.array(zod.string()),
    admin_slug: zod.string(),
    admin_password: zod.string()
});

// TODO enforce this schema.

export type TChatroom = zod.infer<typeof chatroomSchema>;

export default class Chatroom {
    public _id: string
    public name: string;
    public slug: string;
    public valid_until: number;
    public max_users: number;
    public users: TChatroom["users"];
    public auth_type: "none" | "access_tokens";
    public free_access_tokens: Array<string>;
    public banned_users: Array<string>;
    public admin_slug: string;
    public admin_password: string; 

    constructor(details: TChatroom) {
        this._id = details._id;
        this.name = details.name;
        this.slug = details.slug;
        this.valid_until = details.valid_until;
        this.max_users = details.max_users;       
        this.users = details.users;
        this.auth_type = details.auth_type;
        this.free_access_tokens = details.free_access_tokens;
        this.banned_users = details.banned_users;
        this.admin_slug = details.admin_slug;
        this.admin_password = details.admin_password;
    }

    static createNew(details: { 
        name: string;
        valid_until: number;
        max_users: number;
        auth_type: "none" | "access_tokens";
        access_tokens_amount: number;
    }) {

        const chatroom: TChatroom = {
            _id: new mongoose.Types.ObjectId().toString(),
            slug: uuidv4(),
            admin_slug: uuidv4(),
            users: [],
            banned_users: [],
            admin_password: randomString(6),
            free_access_tokens: [],
            ...details,
        }

        if(details.auth_type === "access_tokens")
            chatroom.free_access_tokens = generateAccessTokens(details.access_tokens_amount);        
        else
            chatroom.free_access_tokens = [];
    
        return new Chatroom(chatroom);
    }

    authenticate(credentials: Omit<TUserCredentials, "slug">): boolean {

        switch(this.auth_type) {
            case "none": return true;
            case "access_tokens": {
                const accessTokenIndex = this.free_access_tokens.findIndex( t => t === credentials.access_token);

                return accessTokenIndex >= 0;
            };
        }
        
    }
    
    registerUser(credentials: Omit<TUserCredentials, "slug">): boolean {
        
        if(this.max_users <= this.users.length)
            return false;
    
        const user: { name: string, access_token?: string} = {
            name: "@"+credentials.name
        }
    
        switch(this.auth_type) {
            case "access_tokens": {
                this.free_access_tokens = this.free_access_tokens.filter(
                    acc_token => acc_token !== credentials.access_token
                );
                
                user.access_token = credentials.access_token;
            }
        }
    
        this.users.push(user);
    
        return true;
    }
    
    adminAuthenticate(credentials: Omit<TAdminCredentials, "slug" | "previous_token">): boolean {
        return this.admin_password === credentials.admin_password && this.admin_slug === credentials.admin_slug;
    }
    
    banUser(user_name: string): boolean {
        const usersLengthBefore = this.users?.length || 0;
    
        this.users = this.users.filter( user => user.name !== user_name);
        this.banned_users.push(user_name);
    
        return usersLengthBefore - this.users?.length === 1; 
    }

    removeUser(user_name: string): void {
        this.users = this.users.filter( user => user.name !== user_name);
    }
    
    isUserBanned(user_name: string): boolean {
        return (
            this.banned_users.length > 0 && 
            this.banned_users.findIndex( banned_user => banned_user === user_name) >= 0
        );
    }
    
    removeAccessToken(access_token: string): void {
        this.free_access_tokens = this.free_access_tokens.filter( 
            free_access_token => free_access_token !== access_token
        );
    }
    
    addAccessTokens(amount: number): void {
    
        this.auth_type = "access_tokens";
    
        const newTokens = generateAccessTokens(amount);
    
        this.free_access_tokens = (
            this.free_access_tokens.concat( newTokens )
        );
    
    }
    
    checkPresenceOfUser(name: string): boolean {
        const existingUserIndex = this.users.findIndex( 
            user => user.name === name ||
                    user.name === "@"+name
        );
    
        return existingUserIndex >= 0;
    }
    
    assignSubscriptionIdToUser(subscription_id: string, userName: string) {

        const userIndex = this.users.findIndex( user => user.name === userName );
    
        if(userIndex < 0)
            return;
        
        this.users[userIndex].subscription_id = subscription_id;
    }

    get access_tokens() {
        const result: Array<{token: string; used_by?: string}> = [];
    
        this.free_access_tokens?.forEach( (token: string) => result.push({ token }) );
         
        this.users?.forEach( (user: TChatroom["users"][0]) => 
            user.access_token && 
            result.push({ token: user.access_token, used_by: user.name })
        );

        return result;
    }

}


function generateAccessTokens(amount: number): Array<string> {
    const accessTokens = [];

    for(let i=0; i < amount ; i++)
        accessTokens.push(  randomString(6) )

    return accessTokens;
}

function randomString(length: number): string {
    return Math.random().toString(36).substring(2, length+2);
}

