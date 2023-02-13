import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Sticker {
    @PrimaryKey()
    public id!: number

    @Property({ unique: true })
    public label!: string

    constructor(label: string) {
        this.label = label
    }
}
