"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SqlInExpression_1 = __importDefault(require("./SqlInExpression"));
class SqlNotInExpression extends SqlInExpression_1.default {
    constructor(fieldName, notInExpressionValues, subEntityPath = '', fieldExpression) {
        super(fieldName, notInExpressionValues, subEntityPath, fieldExpression);
        this.fieldName = fieldName;
        this.notInExpressionValues = notInExpressionValues;
    }
    toSqlString() {
        var _a;
        if (!this.inExpressionValues) {
            return '';
        }
        const values = this.inExpressionValues
            .map((_, index) => ':' +
            this.subEntityPath.replace('_', 'xx') +
            'xx' +
            this.fieldName.replace('_', 'xx') +
            (index + 1).toString())
            .join(', ');
        return ((_a = this.fieldExpression) !== null && _a !== void 0 ? _a : this.fieldName) + ' NOT IN (' + values + ')';
    }
}
exports.default = SqlNotInExpression;
//# sourceMappingURL=SqlNotInExpression.js.map