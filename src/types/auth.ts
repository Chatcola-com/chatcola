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