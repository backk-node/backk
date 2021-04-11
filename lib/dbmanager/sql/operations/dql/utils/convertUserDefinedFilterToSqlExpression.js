"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SqlInExpression_1 = __importDefault(require("../../../expressions/SqlInExpression"));
const SqlNotInExpression_1 = __importDefault(require("../../../expressions/SqlNotInExpression"));
function convertUserDefinedFilterToSqlExpression({ subEntityPath, fieldName, fieldFunction, operator, value, orFilters }, index) {
    let fieldExpression = fieldName;
    if (fieldFunction) {
        if (fieldFunction !== 'YEAR' &&
            fieldFunction !== 'MONTH' &&
            fieldFunction !== 'DAY' &&
            fieldFunction != 'WEEKDAY' &&
            fieldFunction != 'WEEK' &&
            fieldFunction !== 'QUARTER' &&
            fieldFunction !== 'HOUR' &&
            fieldFunction !== 'MINUTE' &&
            fieldFunction !== 'SECOND') {
            fieldExpression = fieldFunction + '(' + fieldName + ')';
        }
        else {
            fieldExpression = 'EXTRACT(' + fieldFunction + ' FROM ' + fieldName + ')';
        }
    }
    if (operator === 'IN' && fieldName) {
        return new SqlInExpression_1.default(fieldName, value, subEntityPath !== null && subEntityPath !== void 0 ? subEntityPath : '', fieldExpression).toSqlString();
    }
    else if (operator === 'NOT IN' && fieldName) {
        return new SqlNotInExpression_1.default(fieldName, value, subEntityPath !== null && subEntityPath !== void 0 ? subEntityPath : '', fieldExpression).toSqlString();
    }
    else if (operator === 'IS NULL' || operator === 'IS NOT NULL') {
        return `${fieldExpression} ${operator}`;
    }
    else if (!operator) {
        return `${fieldExpression} = :${(subEntityPath !== null && subEntityPath !== void 0 ? subEntityPath : '').replace('.', 'xx')}xx${fieldName}${index}`;
    }
    else if (operator === 'OR' && orFilters) {
        return (' (' +
            orFilters
                .map((orFilter, orFilterIndex) => convertUserDefinedFilterToSqlExpression({ ...orFilter, subEntityPath }, `${index}xx${orFilterIndex}`))
                .join(' OR ') +
            ') ');
    }
    return `${fieldExpression} ${operator} :${(subEntityPath !== null && subEntityPath !== void 0 ? subEntityPath : '').replace('.', 'xx')}xx${fieldName}${index}`;
}
exports.default = convertUserDefinedFilterToSqlExpression;
//# sourceMappingURL=convertUserDefinedFilterToSqlExpression.js.map