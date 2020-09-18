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
import { Inject, Service } from "typedi";
import { IFileService } from "../types/infrastructure";

const FILE_NAMESPACE = "attachment";

@Service()
export default class AttachmentsService {

    constructor(
        @Inject("fileService") private fileService: IFileService
    ) {};

    async saveMessageAttachment(messageId: string, attachmentContent: string) {
        await this.fileService.writeFile(FILE_NAMESPACE, messageId, attachmentContent);
    }

    async getAttachmentOfMessage(messageId: string): Promise<string | null> {
        return await this.fileService.readFile(FILE_NAMESPACE, messageId);
    }

    async eraseAttachmentOfMessage(messageId: string): Promise<void> {
        await this.fileService.eraseFile(FILE_NAMESPACE, messageId);
    }
}