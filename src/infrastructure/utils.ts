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

export async function sleep(time: number) {
    return new Promise(r => {
        setTimeout(r, time);
    })
}