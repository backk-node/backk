"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function convertMongoDbQueriesToMatchExpression(filters) {
    return filters.reduce((matchExpression, mongoDbQuery) => {
        return {
            ...matchExpression,
            ...mongoDbQuery.filterQuery
        };
    }, {});
}
exports.default = convertMongoDbQueriesToMatchExpression;
//# sourceMappingURL=convertMongoDbQueriesToMatchExpression.js.map