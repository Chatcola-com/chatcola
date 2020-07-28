/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import Joi from "@hapi/joi";

const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;

export default {
    chatroom: {
        create: Joi.object().keys({
            name: Joi.string().required(),
            valid_until: Joi.number().required(),
            max_users: Joi.number().min(2).max(100).default(10),
            access_tokens_amount: Joi.number().default(0).max(100),
            auth_type: Joi.string().valid("none", "access_tokens")
        }),
        generateAccessTokens: Joi.object().keys({
            amount: Joi.number().required()
        })
    },
    auth: {
        login: Joi.object().keys({
            slug: Joi.string().required(),
            name: Joi.string().required(),
            access_token: Joi.string(),
            admin_token: Joi.string().regex(jwtRegex)
        }),
        adminLogin: Joi.object().keys({
            admin_password: Joi.string().required(),
            admin_slug: Joi.string().required(),
            slug: Joi.string().required()
        })
    },
    push: {
        subscribeFromWeb: Joi.object().keys({
            details: Joi.string().required()
        }),
        subscribeToChatroom: Joi.object().keys({
            chatroomToken: Joi.string().regex(jwtRegex).required(),
            pushSubscriptionToken: Joi.string().regex(jwtRegex).required(),
        }),
        isSubscriptionValid: Joi.object().keys({
            pushSubscriptionToken: Joi.string().regex(jwtRegex).required()
        })
    }
}