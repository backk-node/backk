"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SqlExpression_1 = __importDefault(require("./SqlExpression"));
const shouldUseRandomInitializationVector_1 = __importDefault(require("../../../crypt/shouldUseRandomInitializationVector"));
const shouldEncryptValue_1 = __importDefault(require("../../../crypt/shouldEncryptValue"));
const encrypt_1 = __importDefault(require("../../../crypt/encrypt"));
class SqlInExpression extends SqlExpression_1.default {
    constructor(fieldName, inExpressionValues, subEntityPath = '', fieldExpression) {
        super('', {}, subEntityPath);
        this.fieldName = fieldName;
        this.inExpressionValues = inExpressionValues;
        this.fieldExpression = fieldExpression;
    }
    getValues() {
        if (this.inExpressionValues) {
            return this.inExpressionValues.reduce((filterValues, value, index) => {
                let finalValue = value;
                if (!shouldUseRandomInitializationVector_1.default(this.fieldName) && shouldEncryptValue_1.default(this.fieldName)) {
                    finalValue = encrypt_1.default(value, false);
                }
                return {
                    ...filterValues,
                    [`${this.subEntityPath.replace('_', 'xx')}xx${this.fieldName.replace('_', 'xx')}${index +
                        1}`]: finalValue
                };
            }, {});
        }
        return {};
    }
    hasValues() {
        return this.inExpressionValues !== undefined && this.inExpressionValues.length > 0;
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
        return ((_a = this.fieldExpression) !== null && _a !== void 0 ? _a : this.fieldName) + ' IN (' + values + ')';
    }
}
exports.default = SqlInExpression;
//# sourceMappingURL=SqlInExpression.js.map