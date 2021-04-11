"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shouldUseRandomInitializationVector_1 = __importDefault(require("../../crypt/shouldUseRandomInitializationVector"));
const shouldEncryptValue_1 = __importDefault(require("../../crypt/shouldEncryptValue"));
const encrypt_1 = __importDefault(require("../../crypt/encrypt"));
class MongoDbQuery {
    constructor(filterQuery, subEntityPath) {
        this.subEntityPath = subEntityPath !== null && subEntityPath !== void 0 ? subEntityPath : '';
        this.filterQuery = {};
        Object.entries(filterQuery).forEach(([fieldName, fieldValue]) => {
            let finalFieldValue = fieldValue;
            if (!shouldUseRandomInitializationVector_1.default(fieldName) && shouldEncryptValue_1.default(fieldName)) {
                finalFieldValue = encrypt_1.default(fieldValue, false);
            }
            this.filterQuery[fieldName] = finalFieldValue;
        });
    }
}
exports.default = MongoDbQuery;
//# sourceMappingURL=MongoDbQuery.js.map