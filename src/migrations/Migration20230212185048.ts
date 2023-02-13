import { Migration } from '@mikro-orm/migrations';

export class Migration20230212185048 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "sticker" ("id" serial primary key, "label" varchar(255) not null);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "sticker" cascade;');
  }

}
