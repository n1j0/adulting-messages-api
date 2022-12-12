import { Migration } from '@mikro-orm/migrations';

export class Migration20221212202442 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "message" ("id" serial primary key, "text" varchar(255) not null, "date" date not null);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "message" cascade;');
  }

}
