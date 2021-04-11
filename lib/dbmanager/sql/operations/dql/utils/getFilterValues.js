"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SqlExpression_1 = __importDefault(require("../../../expressions/SqlExpression"));
const UserDefinedFilter_1 = __importDefault(require("../../../../../types/userdefinedfilters/UserDefinedFilter"));
const SqlInExpression_1 = __importDefault(require("../../../expressions/SqlInExpression"));
const SqlNotInExpression_1 = __importDefault(require("../../../expressions/SqlNotInExpression"));
function getUserDefinedFilterValues(filters, parentIndex) {
    return filters
        .filter((filter) => filter instanceof UserDefinedFilter_1.default)
        .reduce((accumulatedFilterValues, filter, index) => {
        var _a, _b;
        const userDefinedFilter = filter;
        if (userDefinedFilter.operator === 'OR') {
            return getUserDefinedFilterValues(userDefinedFilter.orFilters
                ? userDefinedFilter.orFilters.map((orFilter) => ({
                    ...orFilter,
                    subEntityPath: filter.subEntityPath
                }))
                : [], index);
        }
        if (!userDefinedFilter.fieldName) {
            throw new Error('fieldName not defined for user defined filter');
        }
        let finalIndexStr = index.toString();
        if (parentIndex !== undefined) {
            finalIndexStr = parentIndex + 'xx' + index;
        }
        let filterValues = {
            [((_b = (_a = filter.subEntityPath) === null || _a === void 0 ? void 0 : _a.replace('.', 'xx')) !== null && _b !== void 0 ? _b : '') +
                'xx' +
                userDefinedFilter.fieldName +
                finalIndexStr]: userDefinedFilter.value
        };
        if (userDefinedFilter.operator === 'IN') {
            filterValues = new SqlInExpression_1.default(userDefinedFilter.fieldName, userDefinedFilter.value).getValues();
        }
        else if (userDefinedFilter.operator === 'NOT IN') {
            filterValues = new SqlNotInExpression_1.default(userDefinedFilter.fieldName, userDefinedFilter.value).getValues();
        }
        return {
            ...accumulatedFilterValues,
            ...filterValues
        };
    }, {});
}
function getFilterValues(filters) {
    if (Array.isArray(filters)) {
        if (filters.length === 0) {
            return {};
        }
        else {
            const sqlExpressionFilterValues = filters
                .filter((filter) => filter instanceof SqlExpression_1.default)
                .reduce((accumulatedFilterValues, filter) => ({
                ...accumulatedFilterValues,
                ...filter.getValues()
            }), {});
            const userDefinedFilterValues = getUserDefinedFilterValues(filters);
            return {
                ...sqlExpressionFilterValues,
                ...userDefinedFilterValues
            };
        }
    }
    return {};
}
exports.default = getFilterValues;
//# sourceMappingURL=getFilterValues.js.map