"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const entityAnnotationContainer_1 = __importDefault(require("../entity/entityAnnotationContainer"));
function Index(sortOrder, usingOption, additionalSqlCreateIndexStatementOptions) {
    return function (object, propertyName) {
        entityAnnotationContainer_1.default.addEntityIndex(object.constructor.name + ':' + propertyName, [propertyName]);
        entityAnnotationContainer_1.default.addIndexSortOrder(object.constructor.name + ':' + propertyName, sortOrder !== null && sortOrder !== void 0 ? sortOrder : 'ASC');
        entityAnnotationContainer_1.default.addUsingOptionForIndex(object.constructor.name + ':' + propertyName, usingOption);
        entityAnnotationContainer_1.default.addAdditionalSqlCreateIndexStatementOptionsForIndex(object.constructor.name + ':' + propertyName, additionalSqlCreateIndexStatementOptions);
    };
}
exports.default = Index;
//# sourceMappingURL=index.js.map