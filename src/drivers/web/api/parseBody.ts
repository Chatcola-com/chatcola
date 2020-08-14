/**
 * original code: https://github.com/uNetworking/uWebSockets.js/blob/master/examples/JsonPost.js
 * modifications: added types; wrapped in a Promise
 */

import { HttpResponse, HttpRequest } from "uWebSockets.js";


export default async function parseBody(res: HttpResponse, req: HttpRequest): Promise<any> {

    const parsedBody = await new Promise( ( resolve, reject ) => {

        let buffer: Buffer;

        res.onData((ab, isLast) => {
            let chunk = Buffer.from(ab);
            if (isLast) {
                
                try {
                    const resolvedBody = buffer ? 
                        Buffer.concat([buffer, chunk]).toString()
                    :
                        chunk.toString();
                    
                    const parsed = JSON.parse(resolvedBody || "{}");

                    resolve(parsed);
                }
                catch (error) {
                    reject(error);
                }

            } else {

                if (buffer) 
                    buffer = Buffer.concat([buffer, chunk]);
                else 
                    buffer = Buffer.concat([chunk]);
            
            }
        });
    
    });

    res["body"] = parsedBody;
    
}
