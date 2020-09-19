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
import { IFileService } from "../types/infrastructure";

import fsSync from "fs";
import fs from "fs/promises";

import config from "./config";
import path from "path";


const targetDir = path.resolve(config.assetsPath, "received");

function getFilepath(namespace: string, name: string) {
    return path.resolve(targetDir, `${namespace}-${name}`)
}

const fileService: IFileService = {
    init() {
        if(!fsSync.existsSync(targetDir))
            fsSync.mkdirSync(targetDir);
    },
    async readFile(namespace: string, name: string) {
        return fs.readFile(getFilepath(namespace, name), {
            encoding: "ascii"
        })
    },
    async writeFile(namespace: string, name: string, content: string) {
        return fs.writeFile(getFilepath(namespace, name), content, {
            encoding: "ascii"
        })
    },
    async eraseFile(namespace: string, name: string) {
        return fs.unlink(getFilepath(namespace, name)).catch();
    }
}

const fakeFileSystemXD: {
    [filename: string]: string
} = {};

export const inMemoryFileService: IFileService = {
    init() {

    },
    async writeFile(namespace, name, content) {
        fakeFileSystemXD[`${namespace}-${name}`] = content;
    },
    async readFile(namespace, name) {
        return fakeFileSystemXD[`${namespace}-${name}`];
    },
    async eraseFile(namespace, name) {
        delete fakeFileSystemXD[`${namespace}-${name}`];
    }
}


export default fileService;