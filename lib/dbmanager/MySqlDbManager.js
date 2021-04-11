"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const AbstractSqlDbManager_1 = __importDefault(require("./AbstractSqlDbManager"));
class MySqlDbManager extends AbstractSqlDbManager_1.default {
    constructor(host, user, password, database) {
        super(database);
        this.host = host;
        this.user = user;
        this.password = password;
        this.pool = promise_1.default.createPool({
            host,
            user,
            password,
            database,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
    getDbManagerType() {
        return 'MySQL';
    }
    getDbHost() {
        return this.host;
    }
    getPool() {
        return this.pool;
    }
    getConnection() {
        return promise_1.default.createConnection({
            host: this.host,
            user: this.user,
            password: this.password,
            database: this.schema
        });
    }
    releaseConnection(connection) {
        connection === null || connection === void 0 ? void 0 : connection.destroy();
    }
    getIdColumnType() {
        return 'BIGINT AUTO_INCREMENT PRIMARY KEY';
    }
    getTimestampType() {
        return 'TIMESTAMP';
    }
    getVarCharType(maxLength) {
        if (maxLength < MySqlDbManager.MAX_CHAR_TYPE_LENGTH) {
            return `VARCHAR(${maxLength})`;
        }
        return 'TEXT';
    }
    getResultRows(result) {
        return result[0];
    }
    getResultFields(result) {
        return result[1];
    }
    getValuePlaceholder(index) {
        return '?';
    }
    getReturningIdClause() {
        return '';
    }
    getBeginTransactionStatement() {
        return 'START TRANSACTION';
    }
    getInsertId(result) {
        var _a;
        return (_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.insertId;
    }
    getIdColumnCastType() {
        return 'CHAR(24)';
    }
    executeSql(connection, sqlStatement, values) {
        return connection.execute(sqlStatement, values);
    }
    executeSqlWithNamedPlaceholders(connection, sqlStatement, values) {
        connection.config.namedPlaceholders = true;
        const result = connection.execute(sqlStatement, values);
        connection.config.namedPlaceholders = false;
        return result;
    }
    getModifyColumnStatement(schema, tableName, columnName, columnType) {
        return `ALTER TABLE ${schema === null || schema === void 0 ? void 0 : schema.toLowerCase()}.${tableName.toLowerCase()} MODIFY COLUMN ${columnName.toLowerCase()} ${columnType}`;
    }
    isDuplicateEntityError(error) {
        return error.message.startsWith('Duplicate entry');
    }
    getAffectedRows(result) {
        return result.affectedRows;
    }
    shouldConvertTinyIntegersToBooleans() {
        return true;
    }
    getBooleanType() {
        return 'TINYINT';
    }
    getUpdateForClause() {
        return "FOR UPDATE";
    }
    castAsBigint(columnName) {
        return `CAST(${columnName} AS UNSIGNED)`;
    }
}
exports.default = MySqlDbManager;
MySqlDbManager.MAX_CHAR_TYPE_LENGTH = 16383;
//# sourceMappingURL=MySqlDbManager.js.map