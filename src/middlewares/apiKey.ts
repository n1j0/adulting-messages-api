import { NextFunction, Request, Response } from "express";

export const apiKey = ({ key = process.env.API_KEY } = {}) => (request: Request, response: Response, next: NextFunction) => {
    const { apiKey } = request.query

    if (!apiKey || apiKey !== key) {
        return response.status(401).json({ error: 'Invalid API Key' })
    }

    return next()
}