import getClassPropertyNameToPropertyTypeNameMap from '../../../../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import getTypeInfoForTypeName from '../../../../../utils/type/getTypeInfoForTypeName';
import isEntityTypeName from '../../../../../utils/type/isEntityTypeName';
import isPropertyReadDenied from "../../../../../utils/type/isPropertyReadDenied";

function removeObjectReadDeniedProperties(result: any, EntityClass: Function, Types: object) {
  const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass as any);

  Object.entries(entityMetadata).forEach(([fieldName, fieldTypeName]: [any, any]) => {
    const { baseTypeName, isArrayType } = getTypeInfoForTypeName(fieldTypeName);

    if (isPropertyReadDenied(EntityClass, fieldName) && result[fieldName]) {
      result[fieldName] = undefined;
    }

    if (isArrayType && isEntityTypeName(baseTypeName)) {
      result[fieldName].forEach((subResult: any) =>
        removeObjectReadDeniedProperties(subResult, (Types as any)[baseTypeName], Types)
      );
    } else if (isEntityTypeName(baseTypeName)) {
      removeObjectReadDeniedProperties(result[fieldName], (Types as any)[baseTypeName], Types);
    }
  });
}

export default function removeReadDeniedProperties(results: object[], entityClass: Function, Types: object) {
  results.forEach((result) => removeObjectReadDeniedProperties(result, entityClass, Types));
}
