import { Entity, PrimaryKey, Property, types } from '@mikro-orm/core'

@Entity()
export class Message {
    @PrimaryKey()
    public id!: number

    @Property()
    public text!: string

    @Property()
    public sticker!: string[]

    @Property({ type: types.date, onUpdate: () => new Date() })
    public date = new Date()

    constructor(text: string, sticker: string[] = []) {
        this.text = text
        this.sticker = sticker
    }
}
