import 'dotenv/config'
import express, { Request, Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { MikroORM, RequestContext } from '@mikro-orm/core'
import type { PostgreSqlDriver } from '@mikro-orm/postgresql'
import mikroOrmConfig from './config/mikro-orm.config.js'
import { Message } from './entities/message.js'

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
        RequestContext.create(orm.em, next);
    })

    server.disable('x-powered-by')

    const router = express.Router()

    router.get('/messages', async (req: Request, res: Response) => {
        const em = orm.em.fork()
        return res.status(200).json(await em.find('Message', {} as any, { limit: 100, orderBy: [ { id: 'DESC' }] }))
    })

    router.get('/messages/:id', async (req: Request, res: Response) => {
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

    router.post('/add', async (req: Request, res: Response) => {
        const { msg } = req.query
        if (!msg) {
            return res.status(400).json({ message: 'Missing Message' })
        }
        if (typeof msg !== 'string') {
            return res.status(400).json({ message: 'Message must be a string' })
        }
        const em = orm.em.fork()
        const message = new Message(msg.trim())
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
