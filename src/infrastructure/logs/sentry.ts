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