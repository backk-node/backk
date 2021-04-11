"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getProjection_1 = __importDefault(require("./getProjection"));
const getRootProjection_1 = __importDefault(require("./getRootProjection"));
const getRootOperations_1 = __importDefault(require("./getRootOperations"));
const SortBy_1 = __importDefault(require("../../types/postqueryoperations/SortBy"));
const Pagination_1 = __importDefault(require("../../types/postqueryoperations/Pagination"));
function performPostQueryOperations(cursor, postQueryOperations, EntityClass, Types) {
    const projection = getProjection_1.default(EntityClass, postQueryOperations);
    const rootProjection = getRootProjection_1.default(projection, EntityClass, Types);
    if (Object.keys(rootProjection).length > 0) {
        cursor.project(rootProjection);
    }
    let sortBys = postQueryOperations === null || postQueryOperations === void 0 ? void 0 : postQueryOperations.sortBys;
    if (!sortBys) {
        sortBys = [new SortBy_1.default('*', '_id', 'ASC'), new SortBy_1.default('*', 'id', 'ASC')];
    }
    const rootSortBys = getRootOperations_1.default(sortBys, EntityClass, Types);
    if (rootSortBys.length > 0) {
        const sorting = rootSortBys.reduce((accumulatedSortObj, { fieldName, sortDirection }) => ({
            ...accumulatedSortObj,
            [fieldName]: sortDirection === 'ASC' ? 1 : -1
        }), {});
        cursor.sort(sorting);
    }
    let paginations = postQueryOperations === null || postQueryOperations === void 0 ? void 0 : postQueryOperations.paginations;
    if (!paginations) {
        paginations = [new Pagination_1.default('*', 1, 50)];
    }
    let rootPagination = paginations.find((pagination) => !pagination.subEntityPath);
    if (!rootPagination) {
        rootPagination = paginations.find((pagination) => pagination.subEntityPath === '*');
    }
    if (rootPagination) {
        cursor.skip((rootPagination.pageNumber - 1) * rootPagination.pageSize).limit(rootPagination.pageSize);
    }
}
exports.default = performPostQueryOperations;
//# sourceMappingURL=performPostQueryOperations.js.map