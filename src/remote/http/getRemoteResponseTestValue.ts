import getClassPropertyNameToPropertyTypeNameMap from '../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import testValueContainer from '../../decorators/typeproperty/testing/testValueContainer';
import getValidationConstraint from '../../validation/getValidationConstraint';
import getTypeInfoForTypeName from '../../utils/type/getTypeInfoForTypeName';
import isEnumTypeName from '../../utils/type/isEnumTypeName';
import parseEnumValuesFromSrcFile from '../../typescript/parser/parseEnumValuesFromSrcFile';
import getCustomValidationConstraint from '../../validation/getCustomValidationConstraint';

export default function getRemoteResponseTestValue<T>(
  ResponseClass: new () => T,
  types?: { [key: string]: new () => any }
) {
  const sampleArg: { [key: string]: any } = {};

  Object.entries(getClassPropertyNameToPropertyTypeNameMap(ResponseClass)).forEach(
    ([propertyName, propertyTypeName]: [string, string]) => {
      const { baseTypeName, defaultValueStr, isArrayType, isOptionalType } = getTypeInfoForTypeName(
        propertyTypeName
      );
      if (isOptionalType && defaultValueStr === undefined) {
        return;
      }

      const testValue = testValueContainer.getTestValue(ResponseClass, propertyName);
      const minValue =
        getValidationConstraint(ResponseClass, propertyName, 'min') ??
        getCustomValidationConstraint(ResponseClass, propertyName, 'minMax', 1);

      if (testValue !== undefined) {
        sampleArg[propertyName] = testValue;
      } else if (propertyName === '_id' || propertyName === 'id' || propertyName.endsWith('Id')) {
        sampleArg[propertyName] = '0';
      } else if (baseTypeName.startsWith('integer') || baseTypeName.startsWith('bigint')) {
        sampleArg[propertyName] = minValue;
      } else if (baseTypeName.startsWith('number')) {
        sampleArg[propertyName] = parseFloat(minValue.toFixed(2));
      } else if (baseTypeName.startsWith('boolean')) {
        sampleArg[propertyName] = true;
      } else if (baseTypeName.startsWith('string')) {
        sampleArg[propertyName] = 'abc';
      } else if (baseTypeName.startsWith('Date')) {
        sampleArg[propertyName] = `'${new Date(1).toISOString()}'`;
      } else if (isEnumTypeName(baseTypeName)) {
        let enumValues;
        if (baseTypeName.startsWith('(')) {
          enumValues = baseTypeName.slice(1).split(/[|)]/);
        } else {
          enumValues = parseEnumValuesFromSrcFile(baseTypeName);
        }
        sampleArg[propertyName] =
          enumValues[0][0] === "'"
            ? enumValues[0].split("'")[1]
            : enumValues[0].includes('.')
            ? parseFloat(enumValues[0])
            : parseInt(enumValues[0]);
      } else if (types?.[propertyName]) {
        sampleArg[propertyName] = getRemoteResponseTestValue(types?.[propertyName]);
      }

      if (isArrayType) {
        if (propertyName.endsWith('Ids') && testValue === undefined) {
          sampleArg[propertyName] = ['0'];
        } else {
          sampleArg[propertyName] =
            defaultValueStr === undefined ? [sampleArg[propertyName]] : JSON.parse(defaultValueStr);
        }
      }
    }
  );

  return sampleArg;
}
