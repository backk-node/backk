import AbstractSqlDbManager from './AbstractSqlDbManager';
import { Pool, types } from 'pg';
import { pg } from 'yesql';

export default class PostgreSqlDbManager extends AbstractSqlDbManager {
  private readonly pool: Pool;

  constructor(
    private readonly host: string,
    port: number,
    user: string,
    password: string,
    database: string,
    schema: string
  ) {
    super(schema);

    // noinspection MagicNumberJS
    types.setTypeParser(20, 'text', parseInt);

    this.pool = new Pool({
      user,
      host,
      database,
      password,
      port
    });
  }

  getDbManagerType(): string {
    return 'PostgreSQL';
  }

  getDbHost(): string {
    return this.host;
  }

  getPool(): any {
    return this.pool;
  }

  getConnection(): Promise<any> {
    return this.pool.connect();
  }

  releaseConnection(connection?: any) {
    connection?.release();
  }

  getIdColumnType(): string {
    return 'BIGSERIAL PRIMARY KEY';
  }

  getTimestampType(): string {
    return 'TIMESTAMPTZ';
  }

  getVarCharType(maxLength: number): string {
    return `VARCHAR(${maxLength})`;
  }

  getResultRows(result: any): any[] {
    return result.rows;
  }

  getResultFields(result: any): any[] {
    return result.fields;
  }

  getValuePlaceholder(index: number): string {
    return `$${index}`;
  }

  getReturningIdClause(idFieldName: string): string {
    return `RETURNING ${idFieldName}`;
  }

  getBeginTransactionStatement(): string {
    return 'BEGIN';
  }

  getInsertId(result: any, idFieldName: string): number {
    return result?.rows[0]?.[idFieldName];
  }

  getIdColumnCastType(): string {
    return 'VARCHAR';
  }

  executeSql(connection: any, sqlStatement: string, values?: any[]): Promise<any> {
    return connection.query(sqlStatement, values);
  }

  executeSqlWithNamedPlaceholders(connection: any, sqlStatement: string, values: object): Promise<any> {
    return connection.query(pg(sqlStatement)(values));
  }

  getModifyColumnStatement(
    schema: string,
    tableName: string,
    columnName: string,
    columnType: string
  ): string {
    return `ALTER TABLE ${schema?.toLowerCase()}.${tableName.toLowerCase()} ALTER COLUMN ${columnName.toLowerCase()} SET DATA TYPE ${columnType}`;
  }

  isDuplicateEntityError(error: Error): boolean {
    return error.message.startsWith('duplicate key');
  }

  getAffectedRows(result: any): number {
    return result.rowCount;
  }

  shouldConvertTinyIntegersToBooleans(): boolean {
    return false;
  }

  getBooleanType(): string {
    return 'BOOLEAN';
  }

  getUpdateForClause(tableAlias: string): string {
    return `FOR UPDATE OF ${tableAlias}`;
  }

  castAsBigint(columnName: string): string {
    return `CAST(${columnName} AS BIGINT)`
  }
}
