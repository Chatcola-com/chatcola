/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
// TODO move this to TokenService and infer these types from class's static zod schemas

export type TUserCredentials = {
    name: string;
    slug: string;
    access_token?: string;
    admin_token?: string;
}

export type TAdminCredentials = {
    admin_slug: string;
    admin_password: string; 
    slug: string;
}

export type TUserTokenClaims = {
    type: "user";
    slug: string;
    name: string;
}

export type TAdminTokenClaims = {
    type: "admin";
    slug: string;
}

export type ITokenClaims = TUserTokenClaims | TAdminTokenClaims;