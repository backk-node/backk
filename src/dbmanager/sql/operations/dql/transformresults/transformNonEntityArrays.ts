import getClassPropertyNameToPropertyTypeNameMap from '../../../../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import getTypeInfoForTypeName from '../../../../../utils/type/getTypeInfoForTypeName';
import isEntityTypeName from '../../../../../utils/type/isEntityTypeName';

function transformNonEntityArray(result: any, EntityClass: Function, Types: object) {
  const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass as any);

  Object.entries(entityMetadata).forEach(([fieldName, fieldTypeName]: [any, any]) => {
    const { baseTypeName, isArrayType } = getTypeInfoForTypeName(fieldTypeName);

    if (result[fieldName]) {
      if (isArrayType && isEntityTypeName(baseTypeName)) {
        result[fieldName].forEach((subResult: any) =>
          transformNonEntityArray(subResult, (Types as any)[baseTypeName], Types)
        );
      } else if (isEntityTypeName(baseTypeName)) {
        transformNonEntityArray(result[fieldName], (Types as any)[baseTypeName], Types);
      } else if (isArrayType) {
        const singularFieldName = fieldName.slice(0, -1);
        result[fieldName] = result[fieldName].map((obj: any) => obj[singularFieldName]);
      }
    }
  });
}

export default function transformNonEntityArrays(results: object[], entityClass: Function, Types: object) {
  results.forEach((result) => transformNonEntityArray(result, entityClass, Types));
}
