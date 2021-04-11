"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SqlExpression_1 = __importDefault(require("./SqlExpression"));
const shouldUseRandomInitializationVector_1 = __importDefault(require("../../../crypt/shouldUseRandomInitializationVector"));
const shouldEncryptValue_1 = __importDefault(require("../../../crypt/shouldEncryptValue"));
const encrypt_1 = __importDefault(require("../../../crypt/encrypt"));
class SqlEquals extends SqlExpression_1.default {
    constructor(filters, subEntityPath = '') {
        super('', {}, subEntityPath);
        this.filters = filters;
    }
    getValues() {
        return Object.entries(this.filters)
            .filter(([, fieldValue]) => fieldValue !== null)
            .reduce((filterValues, [fieldName, fieldValue]) => {
            let finalFieldValue = fieldValue;
            if (!shouldUseRandomInitializationVector_1.default(fieldName) && shouldEncryptValue_1.default(fieldName)) {
                finalFieldValue = encrypt_1.default(fieldValue, false);
            }
            return {
                ...filterValues,
                [`${this.subEntityPath.replace('.', 'xx')}xx${fieldName}`]: finalFieldValue
            };
        }, {});
    }
    hasValues() {
        return true;
    }
    toSqlString() {
        return Object.entries(this.filters)
            .filter(([, fieldValue]) => fieldValue !== undefined)
            .map(([fieldName, fieldValue]) => fieldValue === null
            ? `${fieldName} IS NULL`
            : `${fieldName} = :${this.subEntityPath.replace('.', 'xx')}xx${fieldName}`)
            .join(' AND ');
    }
}
exports.default = SqlEquals;
//# sourceMappingURL=SqlEquals.js.map