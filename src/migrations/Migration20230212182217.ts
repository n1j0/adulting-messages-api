import { Migration } from '@mikro-orm/migrations';

export class Migration20230212182217 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "message" add column "sticker" text[] not null DEFAULT array[]::text[];');
  }

  async down(): Promise<void> {
    this.addSql('alter table "message" drop column "sticker";');
  }

}
