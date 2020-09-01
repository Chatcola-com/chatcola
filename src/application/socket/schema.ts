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
import * as zod from "zod";

export default zod.union([
    zod.object({
        type: zod.literal("start_typing"),
        data: zod.object({})
    }),
    zod.object({
        type: zod.literal("stop_typing"),
        data: zod.object({})
    }),
    zod.object({
        type: zod.literal("whoami"),
        data: zod.object({})
    }),
    zod.object({
        type: zod.literal("ping"),
        data: zod.object({})
    }),
    zod.object({
        type: zod.literal("message"),
        data: zod.object({
            content: zod.string().nonempty()
        })
    })
]);

export type TSocketResponse = {
    broadcast?: boolean;
    body: {
        type: string;
        data: {
            [key: string]: any;
        }
    }
}