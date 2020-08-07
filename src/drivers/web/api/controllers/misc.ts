/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { HttpResponse, HttpRequest } from "uWebSockets.js";

import { Container } from "typedi";
import { TLogger, IKeyService } from "../../../../types/infrastructure";

import thirdPartyLicenses from "../../../../third-party-licenses.json";

import config from "../../config";

const Logger = Container.get<TLogger>("logger");

const keyService = Container.get<IKeyService>("keyservice");

const fourOhFour = (res: HttpResponse, req: HttpRequest) => {

    Logger.info(`${req.getMethod().toUpperCase()} ${req.getUrl()}; 404 Not Found`)

    res.writeStatus(`404 Not Found`);

    res.end(JSON.stringify({
        success: false,
        error: "Not found"
    }))
 }

const options = (res: HttpResponse, req: HttpRequest) => {

    res.writeHeader(`Access-Control-Allow-Origin`, "*");
    res.writeHeader(`Access-Control-Allow-Methods`, `*`);
    res.writeHeader(`Access-Control-Allow-Headers`, `*`);
    res.writeHeader(`Access-Control-Max-Age`, `-1`);
    
    res.end();
}

const getPublicRSAKey = async (res: HttpResponse, req: HttpRequest) => {

    const publicRSAKey = keyService.getPublicKey();

    res.end(JSON.stringify({
        success: true,
        publicRSAKey
    }));
}

async function getLicenses(res: HttpResponse, req: HttpRequest) {

    res.end(JSON.stringify(thirdPartyLicenses))
}

export default {
    fourOhFour, 
    options,
    getPublicRSAKey,
    getLicenses
}