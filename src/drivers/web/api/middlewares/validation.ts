/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { ObjectSchema } from "@hapi/joi";
import { HttpResponse, HttpRequest } from "uWebSockets.js";
import { AppError } from "../../../../infrastructure/utils";


type HttpRequestHandler = (res: HttpResponse, req: HttpRequest) => Promise<void>;


export const validateBody = (schema: ObjectSchema): HttpRequestHandler => {
    
    return async (res: HttpResponse, req: HttpRequest) => {

        const { value, error } = schema.validate(res.body);

        if(error)
            throw new AppError(error.message);

        res["body"] = value;
    }
}