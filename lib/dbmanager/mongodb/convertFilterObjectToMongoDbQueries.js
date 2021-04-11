"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MongoDbQuery_1 = __importDefault(require("./MongoDbQuery"));
function convertFilterObjectToMongoDbQueries(filters) {
    return Object.entries(filters).map(([fieldPathName, fieldValue]) => {
        const lastDotPosition = fieldPathName.lastIndexOf('.');
        if (lastDotPosition !== -1) {
            const fieldName = fieldPathName.slice(lastDotPosition + 1);
            const subEntityPath = fieldPathName.slice(0, lastDotPosition);
            return new MongoDbQuery_1.default({ [fieldName]: fieldValue }, subEntityPath);
        }
        return new MongoDbQuery_1.default({ [fieldPathName]: fieldValue });
    });
}
exports.default = convertFilterObjectToMongoDbQueries;
//# sourceMappingURL=convertFilterObjectToMongoDbQueries.js.map