"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SqlExpression_1 = __importDefault(require("../../../expressions/SqlExpression"));
const UserDefinedFilter_1 = __importDefault(require("../../../../../types/userdefinedfilters/UserDefinedFilter"));
const convertUserDefinedFilterToSqlExpression_1 = __importDefault(require("../utils/convertUserDefinedFilterToSqlExpression"));
function tryGetWhereClause(dbManager, subEntityPath, filters) {
    let filtersSql = '';
    if (Array.isArray(filters) && filters.length > 0) {
        const sqlExpressionFiltersSql = filters
            .filter((filter) => filter instanceof SqlExpression_1.default)
            .filter((sqlExpression) => sqlExpression.subEntityPath === subEntityPath ||
            (subEntityPath === '' && !sqlExpression.subEntityPath) ||
            sqlExpression.subEntityPath === '*')
            .filter((filter) => filter.hasValues())
            .map((filter) => filter.toSqlString())
            .join(' AND ');
        const userDefinedFiltersSql = filters
            .filter((filter) => filter instanceof UserDefinedFilter_1.default)
            .map((filter, index) => {
            if (filter.subEntityPath === subEntityPath ||
                (subEntityPath === '' && !filter.subEntityPath) ||
                filter.subEntityPath === '*') {
                return convertUserDefinedFilterToSqlExpression_1.default(filter, index);
            }
            return undefined;
        })
            .filter((sqlExpression) => sqlExpression)
            .join(' AND ');
        filtersSql = [sqlExpressionFiltersSql, userDefinedFiltersSql]
            .filter((sqlExpression) => sqlExpression)
            .join(' AND ');
    }
    return filtersSql ? `WHERE ${filtersSql}` : '';
}
exports.default = tryGetWhereClause;
//# sourceMappingURL=tryGetWhereClause.js.map