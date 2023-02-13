// Stryker disable all

/*
 @see https://www.rfc-editor.org/rfc/rfc7235
 This is a combined implementation of multiple existing packages/repos
    (e.g. express-basic-auth, basic-auth, basic-connect).
 In addition, newer syntax, methods and concepts are used (the code was modernized).
 Moreover, the existing packages have awful ESModule support. This is fixed as well.
 */

import { Request, Response, NextFunction } from 'express'

/**
 * RegExp for basic auth credentials
 *
 * credentials = auth-scheme 1*SP token68
 * auth-scheme = "Basic" ; case insensitive
 * token68 1*( ALPHA / DIGIT / "-" / "." / "_" / "~" / "+" / "/" ) *"="
 */

const CREDENTIALS_REGEXP = /^ *[Bb][Aa][Ss][Ii][Cc] +([\w+./~-]+=*) *$/

/**
 * RegExp for basic auth user/pass
 *
 * user-pass   = userid ":" password
 * userid      = *<TEXT excluding ":">
 * password    = *TEXT
 */

const USER_PASS_REGEXP = /^([^:]*):(.*)$/

const getParsedAuthorization = (request: Request) => {
    if (!request.headers || typeof request.headers !== 'object') {
        throw new TypeError('Argument request is required to have headers property')
    }

    const authHeader = request.headers.authorization

    if (typeof authHeader !== 'string') {
        return {}
    }

    const match = CREDENTIALS_REGEXP.exec(authHeader)

    if (!match) {
        return {}
    }

    const decodedUserPassword = USER_PASS_REGEXP.exec(Buffer.from(match[1], 'base64').toString())

    if (!decodedUserPassword) {
        return {}
    }

    return {
        name: decodedUserPassword[1],
        password: decodedUserPassword[2],
    }
}

export const basicAuth = ({
    user = process.env.ADMIN_USER,
    pass = process.env.ADMIN_PASSWORD,
} = {}) => (request: Request, response: Response, next: NextFunction) => {
    const { name, password } = getParsedAuthorization(request)

    if (!name || name !== user || !password || password !== pass) {
        response.set('WWW-Authenticate', 'Basic')
        return response.sendStatus(401)
    }

    return next()
}
