"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shouldUseRandomInitializationVector_1 = __importDefault(require("../../../crypt/shouldUseRandomInitializationVector"));
const shouldEncryptValue_1 = __importDefault(require("../../../crypt/shouldEncryptValue"));
const encrypt_1 = __importDefault(require("../../../crypt/encrypt"));
class SqlExpression {
    constructor(expression, values, subEntityPath = '') {
        this.expression = expression;
        this.values = values;
        this.subEntityPath = subEntityPath;
    }
    toSqlString() {
        return this.expression;
    }
    getValues() {
        if (this.values) {
            return Object.entries(this.values).reduce((filterValues, [fieldName, fieldValue]) => {
                let finalFieldValue = fieldValue;
                if (!shouldUseRandomInitializationVector_1.default(fieldName) && shouldEncryptValue_1.default(fieldName)) {
                    finalFieldValue = encrypt_1.default(fieldValue, false);
                }
                return {
                    ...filterValues,
                    [fieldName]: finalFieldValue
                };
            }, {});
        }
        return this.values;
    }
    hasValues() {
        return Object.values(this.values || {}).reduce((hasValues, value) => hasValues && value !== undefined, true);
    }
}
exports.default = SqlExpression;
//# sourceMappingURL=SqlExpression.js.map