"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractSqlDbManager_1 = __importDefault(require("./AbstractSqlDbManager"));
const pg_1 = require("pg");
const yesql_1 = require("yesql");
class PostgreSqlDbManager extends AbstractSqlDbManager_1.default {
    constructor(host, port, user, password, database, schema) {
        super(schema);
        this.host = host;
        pg_1.types.setTypeParser(20, 'text', parseInt);
        this.pool = new pg_1.Pool({
            user,
            host,
            database,
            password,
            port
        });
    }
    getDbManagerType() {
        return 'PostgreSQL';
    }
    getDbHost() {
        return this.host;
    }
    getPool() {
        return this.pool;
    }
    getConnection() {
        return this.pool.connect();
    }
    releaseConnection(connection) {
        connection === null || connection === void 0 ? void 0 : connection.release();
    }
    getIdColumnType() {
        return 'BIGSERIAL PRIMARY KEY';
    }
    getTimestampType() {
        return 'TIMESTAMPTZ';
    }
    getVarCharType(maxLength) {
        return `VARCHAR(${maxLength})`;
    }
    getResultRows(result) {
        return result.rows;
    }
    getResultFields(result) {
        return result.fields;
    }
    getValuePlaceholder(index) {
        return `$${index}`;
    }
    getReturningIdClause(idFieldName) {
        return `RETURNING ${idFieldName}`;
    }
    getBeginTransactionStatement() {
        return 'BEGIN';
    }
    getInsertId(result, idFieldName) {
        var _a;
        return (_a = result === null || result === void 0 ? void 0 : result.rows[0]) === null || _a === void 0 ? void 0 : _a[idFieldName];
    }
    getIdColumnCastType() {
        return 'VARCHAR';
    }
    executeSql(connection, sqlStatement, values) {
        return connection.query(sqlStatement, values);
    }
    executeSqlWithNamedPlaceholders(connection, sqlStatement, values) {
        return connection.query(yesql_1.pg(sqlStatement)(values));
    }
    getModifyColumnStatement(schema, tableName, columnName, columnType) {
        return `ALTER TABLE ${schema === null || schema === void 0 ? void 0 : schema.toLowerCase()}.${tableName.toLowerCase()} ALTER COLUMN ${columnName.toLowerCase()} SET DATA TYPE ${columnType}`;
    }
    isDuplicateEntityError(error) {
        return error.message.startsWith('duplicate key');
    }
    getAffectedRows(result) {
        return result.rowCount;
    }
    shouldConvertTinyIntegersToBooleans() {
        return false;
    }
    getBooleanType() {
        return 'BOOLEAN';
    }
    getUpdateForClause(tableAlias) {
        return `FOR UPDATE OF ${tableAlias}`;
    }
    castAsBigint(columnName) {
        return `CAST(${columnName} AS BIGINT)`;
    }
}
exports.default = PostgreSqlDbManager;
//# sourceMappingURL=PostgreSqlDbManager.js.map