import 'dotenv/config'
import express, { Request, Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
// @ts-ignore
import filter from 'leo-profanity'
import path from 'node:path'
import { MikroORM, RequestContext, UniqueConstraintViolationException } from '@mikro-orm/core'
import type { PostgreSqlDriver } from '@mikro-orm/postgresql'
import mikroOrmConfig from './config/mikro-orm.config.js'
import { Message } from './entities/message.js'
import { Sticker } from './entities/sticker.js'
import { basicAuth } from './middlewares/basicAuth.js'
import { apiKey } from './middlewares/apiKey.js'

try {
    const orm = await MikroORM.init<PostgreSqlDriver>(mikroOrmConfig)
    const server = express()

    try {
        const migrator = orm.getMigrator()
        const migrations = await migrator.getPendingMigrations()
        if (migrations && migrations.length > 0) {
            await migrator.up()
        }
    } catch (error: any) {
        console.error(`Migration error occurred: ${error.message}`)
    }

    server.use(express.json())
    server.use(helmet())
    server.use(cors())
    server.use((req, res, next) => {
        RequestContext.create(orm.em, next)
    })

    server.set('view engine', 'ejs')
    server.set('views', `${path.dirname(new URL(import.meta.url).pathname)}/views`)

    server.use(express.static('public'))

    server.disable('x-powered-by')

    const router = express.Router()

    router.get('/admin', basicAuth(), async (req: Request, res: Response) => {
        const em = orm.em.fork()
        let entities: Message[]
        try {
            entities = await em.getRepository(Message).findAll()
        } catch (error) {
            return res.status(500).json(error)
        }
        return res.render('table', { title: 'Table Panel', table: 'message', entities })
    })

    router.get('/admin/delete', basicAuth(), async (request: Request, response: Response) => {
        const em = orm.em.fork()
        let entities: any[]
        try {
            const { id } = request.query as { id: string }
            const repository = em.getRepository(Message)
            const repositoryItem = await repository.findOne({ id } as any)
            if (repositoryItem) {
                await repository.removeAndFlush(repositoryItem)
            }
            entities = await repository.findAll()
            return response.render('table', { title: 'Table Panel', table: 'message', entities })
        } catch (error) {
            return response.status(500).json(error)
        }
    })

    router.get('/messages', apiKey(), async (req: Request, res: Response) => {
        const em = orm.em.fork()
        return res.status(200).json(await em.find('Message', {} as any, { limit: 100, orderBy: [{ id: 'DESC' }] }))
    })

    router.get('/sticker', apiKey(), async (req: Request, res: Response) => {
        const em = orm.em.fork()
        return res.status(200).json(await em.find('Sticker', {} as any))
    })

    router.get('/messages/:id', apiKey(), async (req: Request, res: Response) => {
        const { id } = req.params
        if (!id) {
            return res.status(400).json({ message: 'Missing ID' })
        }
        const em = orm.em.fork()
        try {
            return res.status(200).json(await em.findOne('Message', { id } as any))
        } catch (error: any) {
            return res.status(400).json({ message: 'Invalid ID' })
        }
    })

    router.post('/sticker', async (req: Request, res: Response) => {
        const { label } = req.body
        if (!label) {
            return res.status(400).json({ message: 'Missing Label' })
        }
        const em = orm.em.fork()
        const sticker = new Sticker(label)
        try {
            await em.persistAndFlush(sticker)
            return res.status(201).json(sticker)
        } catch (error: any) {
            if (error instanceof UniqueConstraintViolationException) {
                return res.status(400).json({ message: 'Label already exists' })
            }
            return res.status(500).json('Ups something went wrong')
        }
    })

    router.post('/add', async (req: Request, res: Response) => {
        const { msg, sticker } = req.body

        if (!msg) {
            return res.status(400).json({ message: 'Missing Message' })
        }
        if (typeof msg !== 'string') {
            return res.status(400).json({ message: 'Message must be a string' })
        }
        let cleanSticker = sticker
        if (sticker) {
            if (!Array.isArray(sticker)) {
                return res.status(400).json({ message: 'Sticker must be an array' })
            }
            if (sticker.length > 0) {
                for (const s of sticker) {
                    if (typeof s !== 'string') {
                        return res.status(400).json({ message: 'Sticker must be an array of strings' })
                    }
                }
            }
            if (sticker.length > 5) {
                return res.status(400).json({ message: 'Sticker must be an array of strings with a maximum of 5 items' })
            }
            cleanSticker = [...new Set(sticker)]
        }
        const em = orm.em.fork()
        const cleanMsg = filter.clean(msg.trim())
        const message = new Message(cleanMsg, cleanSticker || [])
        try {
            await em.persistAndFlush(message)
            return res.status(201).json(message)
        } catch {
            return res.status(500).json('Ups something went wrong')
        }
    })

    server.use('/', router)

    try {
        server.listen(Number.parseInt(process.env.PORT as string, 10))
    } catch (error: any) {
        console.error('Could not start server', error)
    }
} catch (error: any) {
    console.error(error)
}
