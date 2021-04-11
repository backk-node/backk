"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
function getDefaultIncludeFieldsMap(EntityClass) {
    const entityPropertyNameToEntityPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    return Object.keys(entityPropertyNameToEntityPropertyTypeNameMap).reduce((defaultIncludeFieldsMap, propertyName) => ({
        ...defaultIncludeFieldsMap,
        [propertyName]: 1
    }), {});
}
exports.default = getDefaultIncludeFieldsMap;
//# sourceMappingURL=getDefaultIncludeFieldsMap.js.map