/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import { Container } from "typedi";
import { TJobScheduler } from "types/infrastructure";
import ChatroomService from "../chatroom.service";
import MessageService from "../message.service";
import AlligatorService from "../alligator.service";

import infraConfig from "../../infrastructure/config";

const jobScheudler = Container.get<TJobScheduler>("jobScheduler");

const chatroomService = Container.get(ChatroomService);
const messageService = Container.get(MessageService);
const alligatorService = Container.get(AlligatorService);

export default async function initJobs() {
    
    jobScheudler.schedule("* * * * *", () => chatroomService.clearExpired());
    jobScheudler.schedule("* * * * *", () => messageService.clearStale());

    jobScheudler.schedule("0 * * * *", () => {

        if(infraConfig.driver === "http")
            alligatorService.sayHello()
        else 
            alligatorService.sayHelloP2p();
    });
}