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
import Container from "typedi";
import AttachmentsService from "../src/application/attachments.service";


const attachmentsService = Container.get(AttachmentsService);

describe("Attachments service", () => {

    const fakeId = "234-2323-134-345-34-5345-453";
    const fakeContent = "2343948593485934859034835490";
    
    it("Should read/write properly", async () => {

        await attachmentsService.saveMessageAttachment(
            fakeId,
            fakeContent
        );

        const readValue = 
            await attachmentsService.getAttachmentOfMessage(fakeId);

        expect(
            readValue
        ).toEqual(
            fakeContent
        );
    });

    it("Should let you erase an attachment", async () => {

        await attachmentsService.saveMessageAttachment(fakeId, fakeContent);

        await attachmentsService.eraseAttachmentOfMessage(fakeId);

        const readValue = await attachmentsService.getAttachmentOfMessage(fakeId)

        expect(readValue).not.toBeTruthy();
        expect(readValue).not.toEqual(fakeContent);
    });
})