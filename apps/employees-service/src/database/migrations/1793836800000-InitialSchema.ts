import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1793836800000 implements MigrationInterface {
  name = 'InitialSchema1793836800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`employees\` (
        \`id\` varchar(36) NOT NULL,
        \`employee_code\` varchar(20) NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`email\` varchar(150) NOT NULL,
        \`password_hash\` varchar(100) NOT NULL,
        \`role\` enum ('EMPLOYEE', 'HRD_ADMIN') NOT NULL DEFAULT 'EMPLOYEE',
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6) NULL,
        UNIQUE INDEX \`uq_employees_employee_code\` (\`employee_code\`),
        UNIQUE INDEX \`uq_employees_email\` (\`email\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`employees\``);
  }
}
