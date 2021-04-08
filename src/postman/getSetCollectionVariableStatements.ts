import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';

export default function getSetCollectionVariableStatements(
  entityName: string,
  typeName: string,
  serviceMetadata: ServiceMetadata,
  types: { [key: string]: Function },
  responsePath: string
) {
  if (typeName === 'null') {
    return [];
  }

  const typeMetadata = serviceMetadata.types[typeName];
  let collectionVariableSetStatements: string[] = [];

  Object.entries(typeMetadata).forEach(([propertyName, propertyTypeName]) => {
    const { baseTypeName, isArrayType } = getTypeInfoForTypeName(propertyTypeName);

    if (propertyName === '_id') {
      collectionVariableSetStatements.push('try {');
      collectionVariableSetStatements.push(
        `  pm.collectionVariables.set("${entityName}Id", response${responsePath}_id)`
      );
      collectionVariableSetStatements.push('} catch(error) {\n}');
    } else if (propertyName === 'id') {
      collectionVariableSetStatements.push('try {');
      collectionVariableSetStatements.push(
        `  pm.collectionVariables.set("${entityName}Id", response${responsePath}id)`
      );
      collectionVariableSetStatements.push('} catch(error) {\n}');
    }

    if (types[baseTypeName]) {
      const finalResponsePath = responsePath + propertyName + (isArrayType ? '[0]' : '') + '.';

      collectionVariableSetStatements = collectionVariableSetStatements.concat(
        getSetCollectionVariableStatements(
          baseTypeName.charAt(0).toLowerCase() + baseTypeName.slice(1),
          baseTypeName,
          serviceMetadata,
          types,
          finalResponsePath
        )
      );
    }
  });

  return collectionVariableSetStatements;
}
