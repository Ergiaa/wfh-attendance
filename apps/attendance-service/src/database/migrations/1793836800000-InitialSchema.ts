import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1793836800000 implements MigrationInterface {
  name = 'InitialSchema1793836800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`attendances\` (
        \`id\` varchar(36) NOT NULL,
        \`employee_id\` varchar(36) NOT NULL,
        \`employee_code\` varchar(20) NOT NULL,
        \`employee_name\` varchar(100) NOT NULL,
        \`work_date\` date NOT NULL,
        \`checked_in_at\` datetime(6) NOT NULL,
        \`photo_key\` varchar(255) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX \`idx_attendances_work_date\` (\`work_date\`),
        UNIQUE INDEX \`uq_attendances_employee_work_date\` (\`employee_id\`, \`work_date\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`attendances\``);
  }
}
