/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
export * from "./authenticate";
export * from "./validation";

import { MakeHttpCarousel, HttpMiddlewares as middlewares } from "karuzela";

import { HttpResponse, HttpRequest } from "uWebSockets.js";

import { AppError } from "../../../../infrastructure/utils";

import { Container } from "typedi";
import { TLogger } from "types/infrastructure";

const Logger = Container.get<TLogger>("logger");

export default MakeHttpCarousel({
    globalMiddlewares: [

        middlewares.extractHeaders(["Authorization"]),

        middlewares.cors({
            allowOrigin: "*",
            allowCredentials: false
        }),

        async (res: HttpResponse, req: HttpRequest) => {
            Logger.info(`${req.getMethod().toUpperCase()} ${req.getUrl()}`);
        }

    ],
    errorHandler: async (error: any, res: HttpResponse, req: HttpRequest) => {
        
        Logger.error(error.name+": ", error);

        if(error instanceof AppError) {
            res.writeStatus(`400 Bad Request`);

            res.end(JSON.stringify({
                success: false,
                error: error.message
            }))
        }
        else {
            res.writeStatus(`500 Internal Server Error`);
            
            res.end(JSON.stringify({
                success: false
            }))

            throw error;
        }
    }
});
