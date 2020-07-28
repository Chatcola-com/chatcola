/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import * as Sentry from '@sentry/node';
import { Dedupe as DedupeIntegration } from '@sentry/integrations';

import config from "../config";
import Logger from "./logger";
import { TErrorTracker } from 'types/infrastructure';

if(config.should_report_errors) {
    Sentry.init({
        dsn: "https://ebb3eb5b441349d0863fcd9c586d8260@o386888.ingest.sentry.io/5258873",
        integrations: [
            new DedupeIntegration(),
          ],
          onFatalError: (error: any) => Logger.error(error)
    });
}

export default {
    submit: (err: any) => {
        if(config.should_report_errors)
            Sentry.captureException(err);
    }
} as TErrorTracker;