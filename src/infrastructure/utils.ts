/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/w
import * as Sentry from "@sentry/node";
 
export class AppError extends Error {
    public readonly description: string;
    public readonly shouldReport: boolean;
    public readonly metadata?: {
        [key: string]: any;
    };

    constructor(description: string, options: TAppErrorOptions = {
        shouldReport: false
    }) {
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
        this.description = description;

        const { shouldReport } = options;

        this.shouldReport = shouldReport;

        if(shouldReport) 
            Sentry.captureException(this);
    }
}

type TAppErrorOptions = {
    shouldReport: boolean
}