import testValueContainer from '../decorators/typeproperty/testing/testValueContainer';
import getValidationConstraint from '../validation/getValidationConstraint';
import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';
import isEnumTypeName from '../utils/type/isEnumTypeName';
import parseEnumValuesFromSrcFile from '../typescript/parser/parseEnumValuesFromSrcFile';
import typePropertyAnnotationContainer from '../decorators/typeproperty/typePropertyAnnotationContainer';
import getCustomValidationConstraint from '../validation/getCustomValidationConstraint';
import getSampleStringValue from './getSampleStringValue';
import { ValidationTypes } from 'class-validator';
import { getClassPropertyCustomValidationTestValue } from '../validation/setClassPropertyValidationDecorators';
import entityAnnotationContainer from '../decorators/entity/entityAnnotationContainer';

// noinspection OverlyComplexFunctionJS
export default function getServiceFunctionReturnValueTests(
  serviceTypes: { [key: string]: Function },
  returnValueTypeName: string,
  serviceMetadata: ServiceMetadata,
  responsePath: string,
  isOptional: boolean,
  isUpdate: boolean,
  sampleArg: object | undefined,
  expectedResponseFieldPathNameToFieldValueMapInTests: { [key: string]: any } | undefined,
  isRecursive = false,
  isManyToMany = false,
  fieldPath = ''
): string[] {
  const returnValueMetadata = serviceMetadata.types[returnValueTypeName];
  const types = serviceMetadata.types;
  const serviceEntityName = serviceMetadata.serviceName.split('Service')[0];

  let javascriptLines =
    responsePath === '[0].' || responsePath === '.' ? ['const response = pm.response.json();'] : [];

  Object.entries(returnValueMetadata).forEach(([propertyName, propertyTypeName]) => {
    if (
      propertyName === 'version' ||
      propertyName === 'createdAtTimestamp' ||
      propertyName === 'lastModifiedTimestamp' ||
      typePropertyAnnotationContainer.isTypePropertyPrivate(serviceTypes[returnValueTypeName], propertyName)
    ) {
      return;
    }

    // eslint-disable-next-line prefer-const
    let { baseTypeName, isArrayType, isNullableType, isOptionalType } = getTypeInfoForTypeName(
      propertyTypeName
    );

    isOptionalType = isOptionalType || isOptional;

    const fieldPathName = fieldPath ? fieldPath + '.' + propertyName : propertyName;
    const expectedResponseFieldPathNameToFieldValueMapInTestsKeyCount = Object.keys(
      expectedResponseFieldPathNameToFieldValueMapInTests ?? {}
    ).length;

    let shouldInclude = false;
    if (expectedResponseFieldPathNameToFieldValueMapInTestsKeyCount) {
      if (
        Object.keys(expectedResponseFieldPathNameToFieldValueMapInTests ?? {}).find((expectedFieldPathName) =>
          expectedFieldPathName.startsWith(fieldPathName)
        )
      ) {
        isOptionalType = false;
        shouldInclude = true;
      }
    }

    if (expectedResponseFieldPathNameToFieldValueMapInTestsKeyCount && !shouldInclude) {
      return;
    }

    if (
      sampleArg &&
      (sampleArg as any)[propertyName] === undefined &&
      !expectedResponseFieldPathNameToFieldValueMapInTestsKeyCount
    ) {
      return;
    }

    let testValue;
    let isTestValueJson = false;
    let expectedValue: any;
    let allowAnyValue;
    testValue = testValueContainer.getTestValue(serviceTypes[returnValueTypeName], propertyName);

    if (expectedResponseFieldPathNameToFieldValueMapInTests?.[fieldPathName] !== undefined) {
      testValue = JSON.stringify(expectedResponseFieldPathNameToFieldValueMapInTests[fieldPathName]);
      if (testValue.startsWith('"pm.collectionVariables.get(')) {
        testValue = JSON.parse(testValue);
      }
      isTestValueJson = true;
      isOptionalType = false;
    }

    const customValidationTestValue = getClassPropertyCustomValidationTestValue(
      serviceTypes[returnValueTypeName],
      propertyName
    );

    if (customValidationTestValue) {
      testValue = customValidationTestValue;
    }

    const expectAnyTestValue = testValueContainer.getExpectAnyTestValue(
      serviceTypes[returnValueTypeName],
      propertyName
    );

    const predicate = getCustomValidationConstraint(
      serviceTypes[returnValueTypeName],
      propertyName,
      'shouldBeTrueForEntity',
      1
    );

    const minValue =
      getValidationConstraint(serviceTypes[returnValueTypeName], propertyName, 'min') ??
      getCustomValidationConstraint(serviceTypes[returnValueTypeName], propertyName, 'minMax', 1);

    const maxValue =
      getValidationConstraint(serviceTypes[returnValueTypeName], propertyName, 'max') ??
      getCustomValidationConstraint(serviceTypes[returnValueTypeName], propertyName, 'minMax', 2);

    const minDate = getValidationConstraint(
      serviceTypes[returnValueTypeName],
      propertyName,
      ValidationTypes.MIN_DATE
    );

    const maxDate = getValidationConstraint(
      serviceTypes[returnValueTypeName],
      propertyName,
      ValidationTypes.MAX_DATE
    );

    if (isManyToMany) {
      // noinspection AssignmentToFunctionParameterJS
      isUpdate = false;
    }

    let isBooleanValue;

    const isExternalId = typePropertyAnnotationContainer.isTypePropertyExternalId(
      serviceTypes[returnValueTypeName],
      propertyName
    );

    // noinspection IfStatementWithTooManyBranchesJS
    if (expectAnyTestValue !== undefined) {
      allowAnyValue = true;
    } else if (testValue !== undefined) {
      if (baseTypeName === 'string') {
        getSampleStringValue(serviceTypes[returnValueTypeName], propertyName, isUpdate);
      }

      if (typeof testValue === 'string' && !isTestValueJson) {
        expectedValue = "'" + testValue + "'";
      } else {
        expectedValue = testValue;
      }

      if (typeof testValue === 'boolean') {
        isBooleanValue = true;
      }
    } else if (propertyName === '_id') {
      if (isRecursive) {
        if (entityAnnotationContainer.entityNameToTableNameMap[returnValueTypeName]) {
          expectedValue = `pm.collectionVariables.get('${entityAnnotationContainer.entityNameToTableNameMap[
            returnValueTypeName
          ]
            .charAt(0)
            .toLowerCase() +
            entityAnnotationContainer.entityNameToTableNameMap[returnValueTypeName].slice(1)}Id')`;
        } else {
          expectedValue = `pm.collectionVariables.get('${returnValueTypeName.charAt(0).toLowerCase() +
            returnValueTypeName.slice(1)}Id')`;
        }
      } else {
        const finalServiceEntityName =
          entityAnnotationContainer.entityNameToTableNameMap[
            serviceEntityName.charAt(0).toUpperCase() + serviceEntityName.slice(1)
          ];

        if (finalServiceEntityName) {
          expectedValue = `pm.collectionVariables.get('${finalServiceEntityName.charAt(0).toLowerCase() +
            finalServiceEntityName.slice(1)}Id')`;
        } else {
          expectedValue = `pm.collectionVariables.get('${serviceEntityName}Id')`;
        }
      }
    } else if (propertyName.endsWith('Id') && !isExternalId) {
      expectedValue = `pm.collectionVariables.get('${propertyName}')`;
    } else if (propertyName === 'id') {
      expectedValue = "'0'";
    } else if (isNullableType && !isUpdate && !types[baseTypeName]) {
      expectedValue = null;
    } else {
      let sampleString;

      switch (baseTypeName) {
        case 'string':
          sampleString = getSampleStringValue(
            serviceTypes[returnValueTypeName],
            propertyName,
            propertyName.startsWith('current') ? false : isUpdate
          );
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
            ? `'${maxDate?.toISOString() ?? new Date(120000).toISOString()}'`
            : `'${minDate?.toISOString() ?? new Date(60000).toISOString()}'`;
      }
    }

    if (isEnumTypeName(baseTypeName) && testValue === undefined) {
      let enumValues;
      if (baseTypeName.startsWith('(')) {
        enumValues = baseTypeName.slice(1).split(/[|)]/);
      } else {
        enumValues = parseEnumValuesFromSrcFile(baseTypeName);
      }
      expectedValue = isUpdate && enumValues.length >= 3 ? enumValues[1] : enumValues[0];
    } else if (types[baseTypeName] && testValue === undefined) {
      const finalResponsePath = responsePath + propertyName + (isArrayType ? '[0]' : '') + '.';
      const returnValueTests = getServiceFunctionReturnValueTests(
        serviceTypes,
        baseTypeName,
        serviceMetadata,
        finalResponsePath,
        isOptional,
        isUpdate,
        sampleArg
          ? Array.isArray((sampleArg as any)[propertyName])
            ? (sampleArg as any)[propertyName][0]
            : (sampleArg as any)[propertyName]
          : undefined,
        expectedResponseFieldPathNameToFieldValueMapInTests,
        true,
        typePropertyAnnotationContainer.isTypePropertyManyToMany(
          serviceTypes[returnValueTypeName],
          propertyName
        ),
        fieldPath ? fieldPath + '.' + propertyName : propertyName
      );

      if (isOptionalType) {
        javascriptLines.push(
          `if (response${responsePath}${propertyName} !== undefined && (response${responsePath}${propertyName}.length === undefined || response${responsePath}${propertyName}.length > 0)) {`
        );
        javascriptLines = javascriptLines.concat(returnValueTests);
        javascriptLines.push('}');
      } else {
        javascriptLines = javascriptLines.concat(returnValueTests);
      }

      return javascriptLines;
    }

    if (!allowAnyValue) {
      let expectation;

      if (predicate) {
        expectation = `pm.expect((${predicate})(response${responsePath.slice(0, -1)})).to.eql(true);`;
      } else if (isBooleanValue) {
        expectation = `pm.expect(response${responsePath}${propertyName}).to.${
          expectedValue ? 'be.ok' : 'not.be.ok'
        }`;
      } else {
        expectation = `pm.expect(response${responsePath}${propertyName}).to.eql(${expectedValue});`;
      }

      if (isOptionalType) {
        if (isArrayType && !types[baseTypeName]) {
          javascriptLines.push(
            `pm.test("response${responsePath}${propertyName}", function () {
  if (response${responsePath}${propertyName} !== undefined) 
    return pm.expect(response${responsePath}${propertyName}).to.have.members([${expectedValue}]);
  else 
    return true; 
})`
          );
        } else if (responsePath.startsWith('[0].')) {
          javascriptLines.push(
            `pm.test("response${responsePath}${propertyName}", function () {
  if (response${responsePath.slice(
    0,
    -1
  )} !== undefined && response${responsePath}${propertyName} !== undefined) 
   return ${expectation}
  else 
    return true; 
})`
          );
        } else {
          let collectionVariableCheck = '';
          if (typeof expectedValue === 'string' && expectedValue?.startsWith('pm.collectionVariables.get(')) {
            collectionVariableCheck = `&& ${expectedValue} !== undefined`;
          }

          javascriptLines.push(
            `pm.test("response${responsePath}${propertyName}", function () {
  if (response${responsePath}${propertyName} !== undefined ${collectionVariableCheck}) 
   return ${expectation}
  else 
    return true; 
})`
          );
        }
      } else {
        if (isArrayType && !types[baseTypeName]) {
          javascriptLines.push(
            `pm.test("response${responsePath}${propertyName}", function () {
  pm.expect(response${responsePath}${propertyName}).to.have.members([${expectedValue}]); 
})`
          );
        } else {
          javascriptLines.push(
            `pm.test("response${responsePath}${propertyName}", function () {
  ${expectation}
})`
          );
        }
      }
    }
  });

  return javascriptLines;
}
