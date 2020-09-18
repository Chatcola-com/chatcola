import { Inject, Service } from "typedi";
import { IFileService } from "../types/infrastructure";

@Service()
export default class AttachmentsService {

    constructor(
        @Inject("fileService") private fileService: IFileService
    ) {};
}