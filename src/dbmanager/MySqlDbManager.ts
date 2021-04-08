import mysql, { Pool } from 'mysql2/promise';
import AbstractSqlDbManager from './AbstractSqlDbManager';

export default class MySqlDbManager extends AbstractSqlDbManager {
  private static readonly MAX_CHAR_TYPE_LENGTH = 16383;
  private readonly pool: Pool;

  constructor(
    private readonly host: string,
    private readonly user: string,
    private readonly password: string,
    database: string
  ) {
    super(database);

    this.pool = mysql.createPool({
      host,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  getDbManagerType(): string {
    return 'MySQL';
  }

  getDbHost(): string {
    return this.host;
  }

  getPool(): any {
    return this.pool;
  }

  getConnection(): Promise<any> {
    return mysql.createConnection({
      host: this.host,
      user: this.user,
      password: this.password,
      database: this.schema
    });
  }

  releaseConnection(connection?: any) {
    connection?.destroy();
  }

  getIdColumnType(): string {
    return 'BIGINT AUTO_INCREMENT PRIMARY KEY';
  }

  getTimestampType(): string {
    return 'TIMESTAMP';
  }

  getVarCharType(maxLength: number): string {
    if (maxLength < MySqlDbManager.MAX_CHAR_TYPE_LENGTH) {
      return `VARCHAR(${maxLength})`;
    }
    return 'TEXT';
  }

  getResultRows(result: any): any[] {
    return result[0];
  }

  getResultFields(result: any): any[] {
    return result[1];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getValuePlaceholder(index: number): string {
    return '?';
  }

  getReturningIdClause(): string {
    return '';
  }

  getBeginTransactionStatement(): string {
    return 'START TRANSACTION';
  }

  getInsertId(result: any): number {
    return result?.[0]?.insertId;
  }

  getIdColumnCastType(): string {
    return 'CHAR(24)';
  }

  executeSql(connection: any, sqlStatement: string, values?: any[]): Promise<any> {
    return connection.execute(sqlStatement, values);
  }

  executeSqlWithNamedPlaceholders(connection: any, sqlStatement: string, values: object): Promise<any> {
    connection.config.namedPlaceholders = true;
    const result = connection.execute(sqlStatement, values);
    connection.config.namedPlaceholders = false;
    return result;
  }

  getModifyColumnStatement(
    schema: string,
    tableName: string,
    columnName: string,
    columnType: string
  ): string {
    return `ALTER TABLE ${schema?.toLowerCase()}.${tableName.toLowerCase()} MODIFY COLUMN ${columnName.toLowerCase()} ${columnType}`;
  }

  isDuplicateEntityError(error: Error): boolean {
    return error.message.startsWith('Duplicate entry');
  }

  getAffectedRows(result: any): number {
    return result.affectedRows;
  }

  shouldConvertTinyIntegersToBooleans(): boolean {
    return true;
  }

  getBooleanType(): string {
    return 'TINYINT';
  }

  getUpdateForClause(): string {
    return "FOR UPDATE";
  }

  castAsBigint(columnName: string): string {
    return `CAST(${columnName} AS UNSIGNED)`
  }
}
