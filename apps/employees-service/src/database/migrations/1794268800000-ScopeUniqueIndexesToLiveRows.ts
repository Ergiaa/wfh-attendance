import { type MigrationInterface, type QueryRunner, TableColumn, TableIndex } from 'typeorm';

const TABLE = 'employees';

const uniqueIndexes = (scopedToLiveRows: boolean) =>
  [
    ['uq_employees_employee_code', 'employee_code'],
    ['uq_employees_email', 'email'],
  ].map(
    ([name, column]) =>
      new TableIndex({
        name,
        columnNames: scopedToLiveRows ? [column, 'not_deleted'] : [column],
        isUnique: true,
      }),
  );

export class ScopeUniqueIndexesToLiveRows1794268800000 implements MigrationInterface {
  name = 'ScopeUniqueIndexesToLiveRows1794268800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndices(TABLE, uniqueIndexes(false));
    // addColumn (not raw SQL) so the expression is recorded in typeorm_metadata,
    // which migration:check compares against.
    await queryRunner.addColumn(
      TABLE,
      new TableColumn({
        name: 'not_deleted',
        type: 'tinyint',
        isNullable: true,
        asExpression: 'IF(`deleted_at` IS NULL, 1, NULL)',
        generatedType: 'VIRTUAL',
      }),
    );
    await queryRunner.createIndices(TABLE, uniqueIndexes(true));
  }

  // Fails if a code or email has since been reused by a live row, which is the safe outcome.
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndices(TABLE, uniqueIndexes(true));
    await queryRunner.dropColumn(TABLE, 'not_deleted');
    await queryRunner.createIndices(TABLE, uniqueIndexes(false));
  }
}
