import testValueContainer from '../decorators/typeproperty/testing/testValueContainer';
import getValidationConstraint from '../validation/getValidationConstraint';
import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';
import isEnumTypeName from '../utils/type/isEnumTypeName';
import parseEnumValuesFromSrcFile from '../typescript/parser/parseEnumValuesFromSrcFile';
import typePropertyAnnotationContainer from '../decorators/typeproperty/typePropertyAnnotationContainer';
import {
  doesClassPropertyContainCustomValidation,
  getClassPropertyCustomValidationTestValue
} from '../validation/setClassPropertyValidationDecorators';
import getCustomValidationConstraint from '../validation/getCustomValidationConstraint';
import entityAnnotationContainer from '../decorators/entity/entityAnnotationContainer';
import getSampleStringValue from './getSampleStringValue';
import { ValidationTypes } from 'class-validator';
import isCreateFunction from '../service/crudentity/utils/isCreateFunction';
import isUpdateFunction from '../service/crudentity/utils/isUpdateFunction';

export default function getServiceFunctionTestArgument(
  ServiceClass: Function,
  serviceTypes: { [key: string]: Function },
  functionName: string,
  argTypeName: string,
  serviceMetadata: ServiceMetadata,
  isInitialUpdate: boolean = false,
  updateCount = 1,
  previousUpdateSampleArg?: { [key: string]: any },
  isRecursive = false,
  isManyToMany = false
): object | undefined {
  const sampleArg: { [key: string]: any } = {};
  const argTypeProperties = serviceMetadata.types[argTypeName];
  const types = serviceMetadata.types;
  const serviceEntityName = serviceMetadata.serviceName.split('Service')[0];

  if (argTypeProperties === undefined) {
    return undefined;
  }

  // noinspection FunctionWithMoreThanThreeNegationsJS,OverlyComplexFunctionJS,FunctionTooLongJS
  Object.entries(argTypeProperties).forEach(([propertyName, propertyTypeName]: [string, string]) => {
    if (
      doesClassPropertyContainCustomValidation(
        serviceTypes[argTypeName],
        propertyName,
        'isUndefined',
        undefined,
        '__backk_create__'
      ) &&
      isCreateFunction(ServiceClass, functionName) &&
      (propertyName !== '_id' || (propertyName === '_id' && !isManyToMany))
    ) {
      return;
    }

    if (
      doesClassPropertyContainCustomValidation(
        serviceTypes[argTypeName],
        propertyName,
        'isUndefined',
        undefined,
        '__backk_update__'
      ) &&
      isUpdateFunction(ServiceClass, functionName) &&
      (propertyName !== '_id' || (propertyName === '_id' && !isManyToMany))
    ) {
      return;
    }

    let isUpdate = isInitialUpdate;
    if (
      previousUpdateSampleArg !== undefined &&
      (previousUpdateSampleArg as any)[propertyName] === undefined
    ) {
      isUpdate = false;
    }

    const {
      baseTypeName,
      defaultValueStr,
      isArrayType,
      isNullableType,
      isOptionalType
    } = getTypeInfoForTypeName(propertyTypeName);

    if (isOptionalType && defaultValueStr === undefined && !isUpdate) {
      if (baseTypeName.startsWith('string')) {
        getSampleStringValue(serviceTypes[argTypeName], propertyName, isUpdate);
      }
      return;
    }

    if (isManyToMany) {
      isUpdate = false;
    }

    let testValue = testValueContainer.getTestValue(serviceTypes[argTypeName], propertyName);

    const customValidationTestValue = getClassPropertyCustomValidationTestValue(
      serviceTypes[argTypeName],
      propertyName
    );

    if (customValidationTestValue) {
      testValue = customValidationTestValue;
    }

    const minValue =
      getValidationConstraint(serviceTypes[argTypeName], propertyName, 'min') ??
      getCustomValidationConstraint(serviceTypes[argTypeName], propertyName, 'minMax', 1);

    const maxValue =
      getValidationConstraint(serviceTypes[argTypeName], propertyName, 'max') ??
      getCustomValidationConstraint(serviceTypes[argTypeName], propertyName, 'minMax', 2);

    const isExternalId = typePropertyAnnotationContainer.isTypePropertyExternalId(
      serviceTypes[argTypeName],
      propertyName
    );

    if (propertyName === 'version') {
      sampleArg[propertyName] = -1;
    } else if (propertyName === 'lastModifiedTimestamp') {
      sampleArg[propertyName] = new Date(0);
    } else if (testValue !== undefined) {
      if (baseTypeName.startsWith('string')) {
        getSampleStringValue(serviceTypes[argTypeName], propertyName, isUpdate);
      }

      sampleArg[propertyName] = testValue;
    } else if (propertyName === '_id') {
      if (isRecursive) {
        sampleArg[propertyName] = `{{${argTypeName.charAt(0).toLowerCase() + argTypeName.slice(1)}Id}}`;
      } else {
        const finalServiceEntityName =
          entityAnnotationContainer.entityNameToTableNameMap[
            serviceEntityName.charAt(0).toUpperCase() + serviceEntityName.slice(1)
          ];
        if (finalServiceEntityName) {
          sampleArg[propertyName] = `{{${finalServiceEntityName.charAt(0).toLowerCase() +
            finalServiceEntityName.slice(1)}Id}}`;
        } else {
          sampleArg[propertyName] = `{{${serviceEntityName}Id}}`;
        }
      }
    } else if (propertyName === '_ids') {
      sampleArg[propertyName] = `{{${serviceEntityName}Id}}`;
    } else if (propertyName.endsWith('Id') && !isExternalId) {
      sampleArg[propertyName] = `{{${propertyName}}}`;
    } else if (propertyName === 'id') {
      sampleArg[propertyName] = '0';
    } else if (isNullableType && !isUpdate && !types[baseTypeName]) {
      sampleArg[propertyName] = null;
    } else if (baseTypeName.startsWith('integer') || baseTypeName.startsWith('bigint')) {
      sampleArg[propertyName] = isUpdate ? maxValue : minValue;
    } else if (baseTypeName.startsWith('number')) {
      sampleArg[propertyName] = isUpdate ? parseFloat(maxValue.toFixed(2)) : parseFloat(minValue.toFixed(2));
    } else if (baseTypeName.startsWith('boolean')) {
      sampleArg[propertyName] = !isUpdate;
    } else if (baseTypeName.startsWith('string')) {
      sampleArg[propertyName] = getSampleStringValue(
        serviceTypes[argTypeName],
        propertyName,
        propertyName.startsWith('current') ? false : isUpdate
      );
    } else if (baseTypeName.startsWith('Date')) {
      const minDate = getValidationConstraint(
        serviceTypes[argTypeName],
        propertyName,
        ValidationTypes.MIN_DATE
      );
      const maxDate = getValidationConstraint(
        serviceTypes[argTypeName],
        propertyName,
        ValidationTypes.MAX_DATE
      );
      // noinspection MagicNumberJS
      sampleArg[propertyName] = isUpdate
        ? maxDate ?? new Date(120000).toISOString()
        : new Date(60000).toISOString() ?? minDate;
    } else if (isEnumTypeName(baseTypeName)) {
      let enumValues;
      if (baseTypeName.startsWith('(')) {
        enumValues = baseTypeName.slice(1).split(/[|)]/);
      } else {
        enumValues = parseEnumValuesFromSrcFile(baseTypeName);
      }

      if (isUpdate && enumValues.length >= 3) {
        sampleArg[propertyName] =
          enumValues[1][0] === "'"
            ? enumValues[1].split("'")[1]
            : enumValues[1].includes('.')
            ? parseFloat(enumValues[1])
            : parseInt(enumValues[1]);
      } else {
        sampleArg[propertyName] =
          enumValues[0][0] === "'"
            ? enumValues[0].split("'")[1]
            : enumValues[0].includes('.')
            ? parseFloat(enumValues[0])
            : parseInt(enumValues[0]);
      }
    } else if (types[baseTypeName]) {
      sampleArg[propertyName] = getServiceFunctionTestArgument(
        ServiceClass,
        serviceTypes,
        functionName,
        baseTypeName,
        serviceMetadata,
        isUpdate,
        updateCount,
        previousUpdateSampleArg?.[propertyName],
        true,
        typePropertyAnnotationContainer.isTypePropertyManyToMany(serviceTypes[argTypeName], propertyName)
      );
    }

    if (isArrayType) {
      if (propertyName.endsWith('Ids') && testValue === undefined) {
        let entityName = propertyName.slice(0, -3);
        entityName = entityName.charAt(0).toUpperCase() + entityName.slice(1);
        if (entityAnnotationContainer.entityNameToClassMap[entityName]) {
          sampleArg[propertyName] = [`{{${propertyName.slice(0, -3)}Id}}`];
        } else {
          sampleArg[propertyName] =
            defaultValueStr === undefined
              ? Array.isArray(sampleArg[propertyName])
                ? sampleArg[propertyName]
                : [sampleArg[propertyName]]
              : JSON.parse(defaultValueStr);
        }
      } else {
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
