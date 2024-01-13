import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTableNames1705136240115 implements MigrationInterface {
  name = 'ChangeTableNames1705136240115';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user RENAME TO users;`);
    await queryRunner.query(
      `ALTER TABLE refresh_token RENAME TO refresh_tokens;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users RENAME TO user;`);
    await queryRunner.query(
      `ALTER TABLE refresh_tokens RENAME TO refresh_token;`,
    );
  }
}
