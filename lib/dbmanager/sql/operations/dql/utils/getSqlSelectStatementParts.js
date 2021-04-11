"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tryGetProjection_1 = __importDefault(require("../clauses/tryGetProjection"));
const getJoinClauses_1 = __importDefault(require("../clauses/getJoinClauses"));
const tryGetWhereClause_1 = __importDefault(require("../clauses/tryGetWhereClause"));
const getFilterValues_1 = __importDefault(require("./getFilterValues"));
const tryGetOrderByClause_1 = __importDefault(require("../clauses/tryGetOrderByClause"));
const getPaginationClause_1 = __importDefault(require("../clauses/getPaginationClause"));
const SortBy_1 = __importDefault(require("../../../../../types/postqueryoperations/SortBy"));
const Pagination_1 = __importDefault(require("../../../../../types/postqueryoperations/Pagination"));
const constants_1 = require("../../../../../constants/constants");
function getSqlSelectStatementParts(dbManager, { sortBys, paginations, ...projection }, EntityClass, filters, isInternalCall = false) {
    const Types = dbManager.getTypes();
    const columns = tryGetProjection_1.default(dbManager, projection, EntityClass, Types, isInternalCall);
    const outerSortBys = [];
    if (!sortBys) {
        sortBys = [new SortBy_1.default('*', '_id', 'ASC'), new SortBy_1.default('*', 'id', 'ASC')];
    }
    if (!paginations) {
        paginations = [new Pagination_1.default('*', 1, constants_1.Values._50)];
    }
    const joinClauses = getJoinClauses_1.default(dbManager, '', projection, filters, sortBys, paginations, EntityClass, Types, outerSortBys, isInternalCall);
    const outerSortClause = outerSortBys.length > 0 ? `ORDER BY ${outerSortBys.filter((outerSortBy) => outerSortBy).join(', ')}` : '';
    const filterValues = getFilterValues_1.default(filters);
    const rootWhereClause = tryGetWhereClause_1.default(dbManager, '', filters);
    const rootSortClause = tryGetOrderByClause_1.default(dbManager, '', sortBys, EntityClass, Types);
    const rootPaginationClause = getPaginationClause_1.default('', paginations);
    return {
        columns,
        joinClauses,
        rootWhereClause,
        filterValues,
        rootSortClause,
        rootPaginationClause,
        outerSortClause
    };
}
exports.default = getSqlSelectStatementParts;
//# sourceMappingURL=getSqlSelectStatementParts.js.map