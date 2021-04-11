"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const join_js_1 = __importDefault(require("join-js"));
const transformNonEntityArrays_1 = __importDefault(require("./transformNonEntityArrays"));
const decryptEntities_1 = __importDefault(require("../../../../../crypt/decryptEntities"));
const createResultMaps_1 = __importDefault(require("./createResultMaps"));
const removeSingleSubEntitiesWithNullProperties_1 = __importDefault(require("./removeSingleSubEntitiesWithNullProperties"));
const Pagination_1 = __importDefault(require("../../../../../types/postqueryoperations/Pagination"));
const convertTinyIntegersToBooleans_1 = __importDefault(require("./convertTinyIntegersToBooleans"));
const constants_1 = require("../../../../../constants/constants");
const parsedRowProcessingBatchSize = parseInt((_a = process.env.ROW_PROCESSING_BATCH_SIZE) !== null && _a !== void 0 ? _a : '500', 10);
const ROW_PROCESSING_BATCH_SIZE = isNaN(parsedRowProcessingBatchSize) ? constants_1.Values._500 : parsedRowProcessingBatchSize;
function getMappedRows(rows, resultMaps, EntityClass, dbManager, startIndex, endIndex) {
    const mappedRows = join_js_1.default.map(startIndex && endIndex ? rows.slice(startIndex, endIndex < rows.length ? endIndex : undefined) : rows, resultMaps, EntityClass.name + 'Map', EntityClass.name.toLowerCase() + '_');
    const Types = dbManager.getTypes();
    transformNonEntityArrays_1.default(mappedRows, EntityClass, Types);
    if (dbManager.shouldConvertTinyIntegersToBooleans()) {
        convertTinyIntegersToBooleans_1.default(mappedRows, EntityClass, Types);
    }
    decryptEntities_1.default(mappedRows, EntityClass, Types);
    removeSingleSubEntitiesWithNullProperties_1.default(mappedRows);
    return mappedRows;
}
function transformRowsToObjects(rows, EntityClass, { paginations, includeResponseFields, excludeResponseFields }, dbManager, isInternalCall = false) {
    const resultMaps = createResultMaps_1.default(EntityClass, dbManager.getTypes(), {
        includeResponseFields,
        excludeResponseFields
    }, isInternalCall);
    let mappedRows = [];
    if (rows.length > ROW_PROCESSING_BATCH_SIZE) {
        Array(Math.round(rows.length / ROW_PROCESSING_BATCH_SIZE))
            .fill(1)
            .forEach((rowBatch, index) => {
            setImmediate(() => {
                mappedRows = mappedRows.concat(getMappedRows(rows, resultMaps, EntityClass, dbManager, index * ROW_PROCESSING_BATCH_SIZE, (index + 1) * ROW_PROCESSING_BATCH_SIZE));
            });
        });
    }
    else {
        mappedRows = getMappedRows(rows, resultMaps, EntityClass, dbManager);
    }
    if (!paginations) {
        paginations = [new Pagination_1.default('*', 1, constants_1.Values._50)];
    }
    let rootPagination = paginations.find((pagination) => pagination.subEntityPath === '');
    if (!rootPagination) {
        rootPagination = paginations.find((pagination) => pagination.subEntityPath === '*');
    }
    if (rootPagination && mappedRows.length > rootPagination.pageSize) {
        mappedRows = mappedRows.slice(0, rootPagination.pageSize);
    }
    return mappedRows;
}
exports.default = transformRowsToObjects;
//# sourceMappingURL=transformRowsToObjects.js.map