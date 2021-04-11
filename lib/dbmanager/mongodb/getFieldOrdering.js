"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
function getFieldOrdering(EntityClass) {
    const entityPropertyNameToEntityPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    const newRoot = Object.keys(entityPropertyNameToEntityPropertyTypeNameMap).reduce((defaultIncludeFieldsMap, propertyName) => ({
        ...defaultIncludeFieldsMap,
        [propertyName]: `$${propertyName}`
    }), {});
    return {
        $replaceRoot: {
            newRoot
        }
    };
}
exports.default = getFieldOrdering;
//# sourceMappingURL=getFieldOrdering.js.map