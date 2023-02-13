import { Migration } from '@mikro-orm/migrations';

export class Migration20230213141124 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "sticker" add constraint "sticker_label_unique" unique ("label");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "sticker" drop constraint "sticker_label_unique";');
  }

}
