"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tryGetProjection_1 = __importDefault(require("./tryGetProjection"));
const assertIsSortDirection_1 = __importDefault(require("../../../../../assertions/assertIsSortDirection"));
const createErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../../../../../errors/createErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../../../../../errors/backkErrors");
function tryGetOrderByClause(dbManager, subEntityPath, sortBys, EntityClass, Types, tableAlias) {
    const sortBysForSubEntityPath = sortBys.filter((sortBy) => sortBy.subEntityPath === subEntityPath || (subEntityPath === '' && !sortBy.subEntityPath));
    const sortBysForAllSubEntityPaths = sortBys.filter((sortBy) => sortBy.subEntityPath === '*');
    const sortBysStr = [...sortBysForSubEntityPath, ...sortBysForAllSubEntityPaths]
        .map((sortBy) => {
        assertIsSortDirection_1.default(sortBy.sortDirection);
        let projection;
        try {
            projection = tryGetProjection_1.default(dbManager, {
                includeResponseFields: [subEntityPath ? subEntityPath + '.' + sortBy.fieldName : sortBy.fieldName]
            }, EntityClass, Types);
        }
        catch (error) {
            if (sortBy.subEntityPath !== '*') {
                throw createErrorFromErrorCodeMessageAndStatus_1.default({
                    ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
                    message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message + 'invalid sort field: ' + sortBy.fieldName
                });
            }
        }
        if (projection) {
            if (tableAlias) {
                return (tableAlias.toLowerCase() +
                    '.' +
                    sortBy.fieldName +
                    (sortBy.sortDirection === 'DESC' ? ' ' + sortBy.sortDirection : ''));
            }
            else {
                return sortBy.fieldName + (sortBy.sortDirection === 'DESC' ? ' ' + sortBy.sortDirection : '');
            }
        }
        return undefined;
    })
        .filter((sortByStr) => sortByStr)
        .join(', ');
    if (tableAlias) {
        return sortBysStr;
    }
    else {
        return sortBysStr ? `ORDER BY ${sortBysStr}` : '';
    }
}
exports.default = tryGetOrderByClause;
//# sourceMappingURL=tryGetOrderByClause.js.map