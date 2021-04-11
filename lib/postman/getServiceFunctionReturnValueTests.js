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
const getCustomValidationConstraint_1 = __importDefault(require("../validation/getCustomValidationConstraint"));
const getSampleStringValue_1 = __importDefault(require("./getSampleStringValue"));
const class_validator_1 = require("class-validator");
const setClassPropertyValidationDecorators_1 = require("../validation/setClassPropertyValidationDecorators");
const entityAnnotationContainer_1 = __importDefault(require("../decorators/entity/entityAnnotationContainer"));
function getServiceFunctionReturnValueTests(serviceTypes, returnValueTypeName, serviceMetadata, responsePath, isOptional, isUpdate, sampleArg, expectedResponseFieldPathNameToFieldValueMapInTests, isRecursive = false, isManyToMany = false, fieldPath = '') {
    const returnValueMetadata = serviceMetadata.types[returnValueTypeName];
    const types = serviceMetadata.types;
    const serviceEntityName = serviceMetadata.serviceName.split('Service')[0];
    let javascriptLines = responsePath === '[0].' || responsePath === '.' ? ['const response = pm.response.json();'] : [];
    Object.entries(returnValueMetadata).forEach(([propertyName, propertyTypeName]) => {
        var _a, _b, _c, _d;
        if (propertyName === 'version' ||
            propertyName === 'createdAtTimestamp' ||
            propertyName === 'lastModifiedTimestamp' ||
            typePropertyAnnotationContainer_1.default.isTypePropertyPrivate(serviceTypes[returnValueTypeName], propertyName)) {
            return;
        }
        let { baseTypeName, isArrayType, isNullableType, isOptionalType } = getTypeInfoForTypeName_1.default(propertyTypeName);
        isOptionalType = isOptionalType || isOptional;
        const fieldPathName = fieldPath ? fieldPath + '.' + propertyName : propertyName;
        const expectedResponseFieldPathNameToFieldValueMapInTestsKeyCount = Object.keys(expectedResponseFieldPathNameToFieldValueMapInTests !== null && expectedResponseFieldPathNameToFieldValueMapInTests !== void 0 ? expectedResponseFieldPathNameToFieldValueMapInTests : {}).length;
        let shouldInclude = false;
        if (expectedResponseFieldPathNameToFieldValueMapInTestsKeyCount) {
            if (Object.keys(expectedResponseFieldPathNameToFieldValueMapInTests !== null && expectedResponseFieldPathNameToFieldValueMapInTests !== void 0 ? expectedResponseFieldPathNameToFieldValueMapInTests : {}).find((expectedFieldPathName) => expectedFieldPathName.startsWith(fieldPathName))) {
                isOptionalType = false;
                shouldInclude = true;
            }
        }
        if (expectedResponseFieldPathNameToFieldValueMapInTestsKeyCount && !shouldInclude) {
            return;
        }
        if (sampleArg &&
            sampleArg[propertyName] === undefined &&
            !expectedResponseFieldPathNameToFieldValueMapInTestsKeyCount) {
            return;
        }
        let testValue;
        let isTestValueJson = false;
        let expectedValue;
        let allowAnyValue;
        testValue = testValueContainer_1.default.getTestValue(serviceTypes[returnValueTypeName], propertyName);
        if ((expectedResponseFieldPathNameToFieldValueMapInTests === null || expectedResponseFieldPathNameToFieldValueMapInTests === void 0 ? void 0 : expectedResponseFieldPathNameToFieldValueMapInTests[fieldPathName]) !== undefined) {
            testValue = JSON.stringify(expectedResponseFieldPathNameToFieldValueMapInTests[fieldPathName]);
            if (testValue.startsWith('"pm.collectionVariables.get(')) {
                testValue = JSON.parse(testValue);
            }
            isTestValueJson = true;
            isOptionalType = false;
        }
        const customValidationTestValue = setClassPropertyValidationDecorators_1.getClassPropertyCustomValidationTestValue(serviceTypes[returnValueTypeName], propertyName);
        if (customValidationTestValue) {
            testValue = customValidationTestValue;
        }
        const expectAnyTestValue = testValueContainer_1.default.getExpectAnyTestValue(serviceTypes[returnValueTypeName], propertyName);
        const predicate = getCustomValidationConstraint_1.default(serviceTypes[returnValueTypeName], propertyName, 'shouldBeTrueForEntity', 1);
        const minValue = (_a = getValidationConstraint_1.default(serviceTypes[returnValueTypeName], propertyName, 'min')) !== null && _a !== void 0 ? _a : getCustomValidationConstraint_1.default(serviceTypes[returnValueTypeName], propertyName, 'minMax', 1);
        const maxValue = (_b = getValidationConstraint_1.default(serviceTypes[returnValueTypeName], propertyName, 'max')) !== null && _b !== void 0 ? _b : getCustomValidationConstraint_1.default(serviceTypes[returnValueTypeName], propertyName, 'minMax', 2);
        const minDate = getValidationConstraint_1.default(serviceTypes[returnValueTypeName], propertyName, class_validator_1.ValidationTypes.MIN_DATE);
        const maxDate = getValidationConstraint_1.default(serviceTypes[returnValueTypeName], propertyName, class_validator_1.ValidationTypes.MAX_DATE);
        if (isManyToMany) {
            isUpdate = false;
        }
        let isBooleanValue;
        const isExternalId = typePropertyAnnotationContainer_1.default.isTypePropertyExternalId(serviceTypes[returnValueTypeName], propertyName);
        if (expectAnyTestValue !== undefined) {
            allowAnyValue = true;
        }
        else if (testValue !== undefined) {
            if (baseTypeName === 'string') {
                getSampleStringValue_1.default(serviceTypes[returnValueTypeName], propertyName, isUpdate);
            }
            if (typeof testValue === 'string' && !isTestValueJson) {
                expectedValue = "'" + testValue + "'";
            }
            else {
                expectedValue = testValue;
            }
            if (typeof testValue === 'boolean') {
                isBooleanValue = true;
            }
        }
        else if (propertyName === '_id') {
            if (isRecursive) {
                if (entityAnnotationContainer_1.default.entityNameToTableNameMap[returnValueTypeName]) {
                    expectedValue = `pm.collectionVariables.get('${entityAnnotationContainer_1.default.entityNameToTableNameMap[returnValueTypeName]
                        .charAt(0)
                        .toLowerCase() +
                        entityAnnotationContainer_1.default.entityNameToTableNameMap[returnValueTypeName].slice(1)}Id')`;
                }
                else {
                    expectedValue = `pm.collectionVariables.get('${returnValueTypeName.charAt(0).toLowerCase() +
                        returnValueTypeName.slice(1)}Id')`;
                }
            }
            else {
                const finalServiceEntityName = entityAnnotationContainer_1.default.entityNameToTableNameMap[serviceEntityName.charAt(0).toUpperCase() + serviceEntityName.slice(1)];
                if (finalServiceEntityName) {
                    expectedValue = `pm.collectionVariables.get('${finalServiceEntityName.charAt(0).toLowerCase() +
                        finalServiceEntityName.slice(1)}Id')`;
                }
                else {
                    expectedValue = `pm.collectionVariables.get('${serviceEntityName}Id')`;
                }
            }
        }
        else if (propertyName.endsWith('Id') && !isExternalId) {
            expectedValue = `pm.collectionVariables.get('${propertyName}')`;
        }
        else if (propertyName === 'id') {
            expectedValue = "'0'";
        }
        else if (isNullableType && !isUpdate && !types[baseTypeName]) {
            expectedValue = null;
        }
        else {
            let sampleString;
            switch (baseTypeName) {
                case 'string':
                    sampleString = getSampleStringValue_1.default(serviceTypes[returnValueTypeName], propertyName, propertyName.startsWith('current') ? false : isUpdate);
                    expectedValue = `'${sampleString}'`;
                    break;
                case 'boolean':
                    expectedValue = !isUpdate;
                    isBooleanValue = true;
                    break;
                case 'integer':
                case 'bigint':
                    expectedValue = isUpdate ? maxValue : minValue;
                    break;
                case 'number':
                    expectedValue = isUpdate ? parseFloat(maxValue.toFixed(2)) : parseFloat(minValue.toFixed(2));
                    break;
                case 'Date':
                    expectedValue = isUpdate
                        ? `'${(_c = maxDate === null || maxDate === void 0 ? void 0 : maxDate.toISOString()) !== null && _c !== void 0 ? _c : new Date(120000).toISOString()}'`
                        : `'${(_d = minDate === null || minDate === void 0 ? void 0 : minDate.toISOString()) !== null && _d !== void 0 ? _d : new Date(60000).toISOString()}'`;
            }
        }
        if (isEnumTypeName_1.default(baseTypeName) && testValue === undefined) {
            let enumValues;
            if (baseTypeName.startsWith('(')) {
                enumValues = baseTypeName.slice(1).split(/[|)]/);
            }
            else {
                enumValues = parseEnumValuesFromSrcFile_1.default(baseTypeName);
            }
            expectedValue = isUpdate && enumValues.length >= 3 ? enumValues[1] : enumValues[0];
        }
        else if (types[baseTypeName] && testValue === undefined) {
            const finalResponsePath = responsePath + propertyName + (isArrayType ? '[0]' : '') + '.';
            const returnValueTests = getServiceFunctionReturnValueTests(serviceTypes, baseTypeName, serviceMetadata, finalResponsePath, isOptional, isUpdate, sampleArg
                ? Array.isArray(sampleArg[propertyName])
                    ? sampleArg[propertyName][0]
                    : sampleArg[propertyName]
                : undefined, expectedResponseFieldPathNameToFieldValueMapInTests, true, typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(serviceTypes[returnValueTypeName], propertyName), fieldPath ? fieldPath + '.' + propertyName : propertyName);
            if (isOptionalType) {
                javascriptLines.push(`if (response${responsePath}${propertyName} !== undefined && (response${responsePath}${propertyName}.length === undefined || response${responsePath}${propertyName}.length > 0)) {`);
                javascriptLines = javascriptLines.concat(returnValueTests);
                javascriptLines.push('}');
            }
            else {
                javascriptLines = javascriptLines.concat(returnValueTests);
            }
            return javascriptLines;
        }
        if (!allowAnyValue) {
            let expectation;
            if (predicate) {
                expectation = `pm.expect((${predicate})(response${responsePath.slice(0, -1)})).to.eql(true);`;
            }
            else if (isBooleanValue) {
                expectation = `pm.expect(response${responsePath}${propertyName}).to.${expectedValue ? 'be.ok' : 'not.be.ok'}`;
            }
            else {
                expectation = `pm.expect(response${responsePath}${propertyName}).to.eql(${expectedValue});`;
            }
            if (isOptionalType) {
                if (isArrayType && !types[baseTypeName]) {
                    javascriptLines.push(`pm.test("response${responsePath}${propertyName}", function () {
  if (response${responsePath}${propertyName} !== undefined) 
    return pm.expect(response${responsePath}${propertyName}).to.have.members([${expectedValue}]);
  else 
    return true; 
})`);
                }
                else if (responsePath.startsWith('[0].')) {
                    javascriptLines.push(`pm.test("response${responsePath}${propertyName}", function () {
  if (response${responsePath.slice(0, -1)} !== undefined && response${responsePath}${propertyName} !== undefined) 
   return ${expectation}
  else 
    return true; 
})`);
                }
                else {
                    let collectionVariableCheck = '';
                    if (typeof expectedValue === 'string' && (expectedValue === null || expectedValue === void 0 ? void 0 : expectedValue.startsWith('pm.collectionVariables.get('))) {
                        collectionVariableCheck = `&& ${expectedValue} !== undefined`;
                    }
                    javascriptLines.push(`pm.test("response${responsePath}${propertyName}", function () {
  if (response${responsePath}${propertyName} !== undefined ${collectionVariableCheck}) 
   return ${expectation}
  else 
    return true; 
})`);
                }
            }
            else {
                if (isArrayType && !types[baseTypeName]) {
                    javascriptLines.push(`pm.test("response${responsePath}${propertyName}", function () {
  pm.expect(response${responsePath}${propertyName}).to.have.members([${expectedValue}]); 
})`);
                }
                else {
                    javascriptLines.push(`pm.test("response${responsePath}${propertyName}", function () {
  ${expectation}
})`);
                }
            }
        }
    });
    return javascriptLines;
}
exports.default = getServiceFunctionReturnValueTests;
//# sourceMappingURL=getServiceFunctionReturnValueTests.js.map