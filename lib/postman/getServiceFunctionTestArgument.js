"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testValueContainer_1 = __importDefault(require("../decorators/typeproperty/testing/testValueContainer"));
const getValidationConstraint_1 = __importDefault(require("../validation/getValidationConstraint"));
const getTypeInfoForTypeName_1 = __importDefault(require("../utils/type/getTypeInfoForTypeName"));
const isEnumTypeName_1 = __importDefault(require("../utils/type/isEnumTypeName"));
const parseEnumValuesFromSrcFile_1 = __importDefault(require("../typescript/parser/parseEnumValuesFromSrcFile"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../decorators/typeproperty/typePropertyAnnotationContainer"));
const setClassPropertyValidationDecorators_1 = require("../validation/setClassPropertyValidationDecorators");
const getCustomValidationConstraint_1 = __importDefault(require("../validation/getCustomValidationConstraint"));
const entityAnnotationContainer_1 = __importDefault(require("../decorators/entity/entityAnnotationContainer"));
const getSampleStringValue_1 = __importDefault(require("./getSampleStringValue"));
const class_validator_1 = require("class-validator");
const isCreateFunction_1 = __importDefault(require("../service/crudentity/utils/isCreateFunction"));
const isUpdateFunction_1 = __importDefault(require("../service/crudentity/utils/isUpdateFunction"));
function getServiceFunctionTestArgument(ServiceClass, serviceTypes, functionName, argTypeName, serviceMetadata, isInitialUpdate = false, updateCount = 1, previousUpdateSampleArg, isRecursive = false, isManyToMany = false) {
    const sampleArg = {};
    const argTypeProperties = serviceMetadata.types[argTypeName];
    const types = serviceMetadata.types;
    const serviceEntityName = serviceMetadata.serviceName.split('Service')[0];
    if (argTypeProperties === undefined) {
        return undefined;
    }
    Object.entries(argTypeProperties).forEach(([propertyName, propertyTypeName]) => {
        var _a, _b, _c;
        if (setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(serviceTypes[argTypeName], propertyName, 'isUndefined', undefined, '__backk_create__') &&
            isCreateFunction_1.default(ServiceClass, functionName) &&
            (propertyName !== '_id' || (propertyName === '_id' && !isManyToMany))) {
            return;
        }
        if (setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(serviceTypes[argTypeName], propertyName, 'isUndefined', undefined, '__backk_update__') &&
            isUpdateFunction_1.default(ServiceClass, functionName) &&
            (propertyName !== '_id' || (propertyName === '_id' && !isManyToMany))) {
            return;
        }
        let isUpdate = isInitialUpdate;
        if (previousUpdateSampleArg !== undefined &&
            previousUpdateSampleArg[propertyName] === undefined) {
            isUpdate = false;
        }
        const { baseTypeName, defaultValueStr, isArrayType, isNullableType, isOptionalType } = getTypeInfoForTypeName_1.default(propertyTypeName);
        if (isOptionalType && defaultValueStr === undefined && !isUpdate) {
            if (baseTypeName.startsWith('string')) {
                getSampleStringValue_1.default(serviceTypes[argTypeName], propertyName, isUpdate);
            }
            return;
        }
        if (isManyToMany) {
            isUpdate = false;
        }
        let testValue = testValueContainer_1.default.getTestValue(serviceTypes[argTypeName], propertyName);
        const customValidationTestValue = setClassPropertyValidationDecorators_1.getClassPropertyCustomValidationTestValue(serviceTypes[argTypeName], propertyName);
        if (customValidationTestValue) {
            testValue = customValidationTestValue;
        }
        const minValue = (_a = getValidationConstraint_1.default(serviceTypes[argTypeName], propertyName, 'min')) !== null && _a !== void 0 ? _a : getCustomValidationConstraint_1.default(serviceTypes[argTypeName], propertyName, 'minMax', 1);
        const maxValue = (_b = getValidationConstraint_1.default(serviceTypes[argTypeName], propertyName, 'max')) !== null && _b !== void 0 ? _b : getCustomValidationConstraint_1.default(serviceTypes[argTypeName], propertyName, 'minMax', 2);
        const isExternalId = typePropertyAnnotationContainer_1.default.isTypePropertyExternalId(serviceTypes[argTypeName], propertyName);
        if (propertyName === 'version') {
            sampleArg[propertyName] = -1;
        }
        else if (propertyName === 'lastModifiedTimestamp') {
            sampleArg[propertyName] = new Date(0);
        }
        else if (testValue !== undefined) {
            if (baseTypeName.startsWith('string')) {
                getSampleStringValue_1.default(serviceTypes[argTypeName], propertyName, isUpdate);
            }
            sampleArg[propertyName] = testValue;
        }
        else if (propertyName === '_id') {
            if (isRecursive) {
                sampleArg[propertyName] = `{{${argTypeName.charAt(0).toLowerCase() + argTypeName.slice(1)}Id}}`;
            }
            else {
                const finalServiceEntityName = entityAnnotationContainer_1.default.entityNameToTableNameMap[serviceEntityName.charAt(0).toUpperCase() + serviceEntityName.slice(1)];
                if (finalServiceEntityName) {
                    sampleArg[propertyName] = `{{${finalServiceEntityName.charAt(0).toLowerCase() +
                        finalServiceEntityName.slice(1)}Id}}`;
                }
                else {
                    sampleArg[propertyName] = `{{${serviceEntityName}Id}}`;
                }
            }
        }
        else if (propertyName === '_ids') {
            sampleArg[propertyName] = `{{${serviceEntityName}Id}}`;
        }
        else if (propertyName.endsWith('Id') && !isExternalId) {
            sampleArg[propertyName] = `{{${propertyName}}}`;
        }
        else if (propertyName === 'id') {
            sampleArg[propertyName] = '0';
        }
        else if (isNullableType && !isUpdate && !types[baseTypeName]) {
            sampleArg[propertyName] = null;
        }
        else if (baseTypeName.startsWith('integer') || baseTypeName.startsWith('bigint')) {
            sampleArg[propertyName] = isUpdate ? maxValue : minValue;
        }
        else if (baseTypeName.startsWith('number')) {
            sampleArg[propertyName] = isUpdate ? parseFloat(maxValue.toFixed(2)) : parseFloat(minValue.toFixed(2));
        }
        else if (baseTypeName.startsWith('boolean')) {
            sampleArg[propertyName] = !isUpdate;
        }
        else if (baseTypeName.startsWith('string')) {
            sampleArg[propertyName] = getSampleStringValue_1.default(serviceTypes[argTypeName], propertyName, propertyName.startsWith('current') ? false : isUpdate);
        }
        else if (baseTypeName.startsWith('Date')) {
            const minDate = getValidationConstraint_1.default(serviceTypes[argTypeName], propertyName, class_validator_1.ValidationTypes.MIN_DATE);
            const maxDate = getValidationConstraint_1.default(serviceTypes[argTypeName], propertyName, class_validator_1.ValidationTypes.MAX_DATE);
            sampleArg[propertyName] = isUpdate
                ? maxDate !== null && maxDate !== void 0 ? maxDate : new Date(120000).toISOString() : (_c = new Date(60000).toISOString()) !== null && _c !== void 0 ? _c : minDate;
        }
        else if (isEnumTypeName_1.default(baseTypeName)) {
            let enumValues;
            if (baseTypeName.startsWith('(')) {
                enumValues = baseTypeName.slice(1).split(/[|)]/);
            }
            else {
                enumValues = parseEnumValuesFromSrcFile_1.default(baseTypeName);
            }
            if (isUpdate && enumValues.length >= 3) {
                sampleArg[propertyName] =
                    enumValues[1][0] === "'"
                        ? enumValues[1].split("'")[1]
                        : enumValues[1].includes('.')
                            ? parseFloat(enumValues[1])
                            : parseInt(enumValues[1]);
            }
            else {
                sampleArg[propertyName] =
                    enumValues[0][0] === "'"
                        ? enumValues[0].split("'")[1]
                        : enumValues[0].includes('.')
                            ? parseFloat(enumValues[0])
                            : parseInt(enumValues[0]);
            }
        }
        else if (types[baseTypeName]) {
            sampleArg[propertyName] = getServiceFunctionTestArgument(ServiceClass, serviceTypes, functionName, baseTypeName, serviceMetadata, isUpdate, updateCount, previousUpdateSampleArg === null || previousUpdateSampleArg === void 0 ? void 0 : previousUpdateSampleArg[propertyName], true, typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(serviceTypes[argTypeName], propertyName));
        }
        if (isArrayType) {
            if (propertyName.endsWith('Ids') && testValue === undefined) {
                let entityName = propertyName.slice(0, -3);
                entityName = entityName.charAt(0).toUpperCase() + entityName.slice(1);
                if (entityAnnotationContainer_1.default.entityNameToClassMap[entityName]) {
                    sampleArg[propertyName] = [`{{${propertyName.slice(0, -3)}Id}}`];
                }
                else {
                    sampleArg[propertyName] =
                        defaultValueStr === undefined
                            ? Array.isArray(sampleArg[propertyName])
                                ? sampleArg[propertyName]
                                : [sampleArg[propertyName]]
                            : JSON.parse(defaultValueStr);
                }
            }
            else {
                sampleArg[propertyName] =
                    defaultValueStr === undefined
                        ? Array.isArray(sampleArg[propertyName])
                            ? sampleArg[propertyName]
                            : [sampleArg[propertyName]]
                        : JSON.parse(defaultValueStr);
            }
        }
    });
    return sampleArg;
}
exports.default = getServiceFunctionTestArgument;
//# sourceMappingURL=getServiceFunctionTestArgument.js.map