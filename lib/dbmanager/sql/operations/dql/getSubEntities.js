"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonpath_plus_1 = require("jsonpath-plus");
const getEntityById_1 = __importDefault(require("./getEntityById"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const updateDbLocalTransactionCount_1 = __importDefault(require("./utils/updateDbLocalTransactionCount"));
async function getSubEntities(dbManager, _id, subEntityPath, EntityClass, postQueryOperations, responseMode) {
    updateDbLocalTransactionCount_1.default(dbManager);
    EntityClass = dbManager.getType(EntityClass);
    try {
        const [entity, error] = await getEntityById_1.default(dbManager, _id, EntityClass, { postQueryOperations });
        const subItems = jsonpath_plus_1.JSONPath({ json: entity !== null && entity !== void 0 ? entity : null, path: subEntityPath });
        return responseMode === 'first' ? [[subItems[0]], error] : [subItems, error];
    }
    catch (error) {
        return [null, createBackkErrorFromError_1.default(error)];
    }
}
exports.default = getSubEntities;
//# sourceMappingURL=getSubEntities.js.map