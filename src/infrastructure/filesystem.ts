import { IFileService } from "../types/infrastructure";

import fs from "fs/promises";


const fileService: IFileService = {
    async readFile(path: string) {
        return fs.readFile(path, {
            encoding: "base64"
        })
    },
    async writeFile(path: string, content: string) {
        return fs.writeFile(path, content, {
            encoding: "base64"
        })
    }
}

export default fileService;