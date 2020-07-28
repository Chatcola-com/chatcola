/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { HttpResponse, HttpRequest } from "uWebSockets.js";

import { Container } from "typedi";
import AuthService from "../../../../application/auth.service";
import { AppError } from "../../../../infrastructure/utils";

const authService = Container.get(AuthService);

export default async (res: HttpResponse, req: HttpRequest, context: any) => {

  const upgradeAborted = {aborted: false};
  res.onAborted(() => { upgradeAborted.aborted = true; });

  const secWebSocketKey = req.getHeader('sec-websocket-key');
  const secWebSocketProtocol = req.getHeader('sec-websocket-protocol');
  const secWebSocketExtensions = req.getHeader('sec-websocket-extensions');

  const token = req.getUrl().split("/").pop();

  if(!token)
    throw new AppError(`Unauthorized`);

  try {
    const claims = await authService.validateChatToken(token);

    if(upgradeAborted.aborted) 
      return;
    
    if(claims.type !== "user")
      throw new AppError(`Can't connect to a chat websocket with an admin jwt.`, { shouldReport: true });

    const { slug, name } = claims;

    res.upgrade({
        locals: { slug, name }
      },
      secWebSocketKey,
      secWebSocketProtocol,
      secWebSocketExtensions,
      context
    );
  }
  catch(error) {

      if((error instanceof AppError) === false) 
        throw error;

      if(upgradeAborted.aborted)
        return;

      res.writeStatus(`401 Not Allowed`);
      res.end();
  }
    

}