"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tryCreateIndex_1 = __importDefault(require("./tryCreateIndex"));
async function tryCreateUniqueIndex(dbManager, indexName, schema, indexFields) {
    await tryCreateIndex_1.default(dbManager, indexName, schema, indexFields, true);
}
exports.default = tryCreateUniqueIndex;
//# sourceMappingURL=tryCreateUniqueIndex.js.map