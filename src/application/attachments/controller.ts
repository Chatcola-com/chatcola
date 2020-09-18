import AuthService from "../auth.service";
import Container from "typedi";
import * as zod from "zod";
import { AppError } from "infrastructure/utils";

const authService = Container.get(AuthService);

export default wrappedAttachmentController;

async function attachmentController(
    messageId: string,
    context: zod.infer<typeof attachmentRequestContext>
) {

    const claims = await authService.validateChatToken(context.token);



}

export const attachmentRequestContext = zod.object({
    token: zod.string().nonempty()
})


async function wrappedAttachmentController(
    messageId: string,
    context: zod.infer<typeof attachmentRequestContext>
) {

    try {
        return await attachmentController(messageId, context);
    } catch ( error ) {
        
        if( 
            error instanceof zod.ZodError ||
            (
                error instanceof AppError  &&  
                !error.shouldReport 
            )
        ) {
            return {
                success: false,
                error: error.message,
                data: {}
            }
        }
        else 
            throw error;
    }
}