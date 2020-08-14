import { AppError } from "../../infrastructure/utils";

export async function catchUnauthorized(fn: () => Promise<any>) {

    try {
        const result = await fn();

        return result;
    } catch (error) {
        if(error.message === "Unauthorized") {
            return {
                success: false,
                error: "Unauthorized"
            }
        }
        else 
            throw new AppError(error, {shouldReport: true})
    }
}