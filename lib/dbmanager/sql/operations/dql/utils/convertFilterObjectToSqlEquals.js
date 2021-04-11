"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SqlEquals_1 = __importDefault(require("../../../expressions/SqlEquals"));
function convertFilterObjectToSqlEquals(filters) {
    return Object.entries(filters).map(([fieldPathName, fieldValue]) => {
        const lastDotPosition = fieldPathName.lastIndexOf('.');
        if (lastDotPosition !== -1) {
            const fieldName = fieldPathName.slice(lastDotPosition + 1);
            const subEntityPath = fieldPathName.slice(0, lastDotPosition);
            return new SqlEquals_1.default({ [fieldName]: fieldValue }, subEntityPath);
        }
        return new SqlEquals_1.default({ [fieldPathName]: fieldValue });
    });
}
exports.default = convertFilterObjectToSqlEquals;
//# sourceMappingURL=convertFilterObjectToSqlEquals.js.map