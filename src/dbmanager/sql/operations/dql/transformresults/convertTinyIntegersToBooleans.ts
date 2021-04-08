import getClassPropertyNameToPropertyTypeNameMap from '../../../../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import getTypeInfoForTypeName from '../../../../../utils/type/getTypeInfoForTypeName';
import isEntityTypeName from '../../../../../utils/type/isEntityTypeName';

function convertTinyIntegersToBooleansInRow(result: any, EntityClass: Function, Types: object) {
  const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass as any);

  Object.entries(entityMetadata).forEach(([fieldName, fieldTypeName]: [any, any]) => {
    const { baseTypeName, isArrayType } = getTypeInfoForTypeName(fieldTypeName);

    if (result[fieldName] !== null && result[fieldName] !== undefined) {
      if (isArrayType && isEntityTypeName(baseTypeName)) {
        result[fieldName].forEach((subResult: any) =>
          convertTinyIntegersToBooleansInRow(subResult, (Types as any)[baseTypeName], Types)
        );
      } else if (isEntityTypeName(baseTypeName)) {
        convertTinyIntegersToBooleansInRow(result[fieldName], (Types as any)[baseTypeName], Types);
      } else if (baseTypeName === 'boolean' && isArrayType) {
        result[fieldName] = result[fieldName].map((value: any) => {
          if (value === 0) {
            return false;
          } else if (value === 1) {
            return true;
          }

          return value;
        });
      } else if (baseTypeName === 'boolean') {
        if (result[fieldName] === 0) {
          result[fieldName] = false;
        } else if (result[fieldName] === 1) {
          result[fieldName] = true;
        }
      }
    }
  });
}

export default function convertTinyIntegersToBooleans(results: object[], entityClass: Function, Types: object) {
  results.forEach((result) => convertTinyIntegersToBooleansInRow(result, entityClass, Types));
}
