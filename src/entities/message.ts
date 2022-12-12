import { Entity, PrimaryKey, Property, types } from '@mikro-orm/core'

@Entity()
export class Message {
    @PrimaryKey()
    public id!: number

    @Property()
    public text!: string

    @Property({ type: types.date, onUpdate: () => new Date() })
    public date = new Date()

    constructor(text: string) {
        this.text = text
    }
}
