import AbstractSqlDataStore from './AbstractSqlDataStore';
import { Pool, types } from 'pg';
import { pg } from 'yesql';
import throwException from '../utils/exception/throwException';

export default class PostgreSqlDataStore extends AbstractSqlDataStore {
  private readonly pool: Pool;
  private readonly host: string;

  constructor() {
    super(process.env.DB_NAME ?? throwException('DB_NAME environment variable must be defined'));

    // noinspection MagicNumberJS
    types.setTypeParser(20, 'text', parseInt);
    this.host =
      process.env.POSTGRESQL_HOST ?? throwException('POSTGRESQL_HOST environment variable must be defined');

    this.pool = new Pool({
      user:
        process.env.POSTGRESQL_USER ?? throwException('POSTGRESQL_USER environment variable must be defined'),
      host: this.host,
      database: 'postgres',
      password:
        process.env.POSTGRESQL_USER ?? throwException('POSTGRESQL_USER environment variable must be defined'),
      port: parseInt(
        process.env.POSTGRESQL_PORT ?? throwException('POSTGRESQL_PORT environment variable must be defined'),
        10
      )
    });
  }

  getDataStoreType(): string {
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
    return `CAST(${columnName} AS BIGINT)`;
  }
}
