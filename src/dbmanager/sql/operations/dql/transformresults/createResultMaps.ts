import shouldIncludeField from '../utils/columns/shouldIncludeField';
import { Projection } from '../../../../../types/postqueryoperations/Projection';
import getClassPropertyNameToPropertyTypeNameMap from '../../../../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import getTypeInfoForTypeName from '../../../../../utils/type/getTypeInfoForTypeName';
import isEntityTypeName from '../../../../../utils/type/isEntityTypeName';

function updateResultMaps(
  entityClassOrName: Function | string,
  Types: object,
  resultMaps: any[],
  projection: Projection,
  fieldPath: string,
  isInternalCall: boolean,
  suppliedEntityMetadata: { [key: string]: string } = {},
  ParentEntityClass?: Function,
  tablePath?: string
) {
  let entityMetadata =
    typeof entityClassOrName === 'function'
      ? getClassPropertyNameToPropertyTypeNameMap(entityClassOrName as any)
      : suppliedEntityMetadata;

  const entityName = typeof entityClassOrName === 'function' ? entityClassOrName.name : entityClassOrName;
  if (!tablePath) {
    // noinspection AssignmentToFunctionParameterJS
    tablePath = entityName.toLowerCase();
  }

  let idFieldName = 'id';
  if (entityMetadata._id) {
    idFieldName = '_id';
  }

  const resultMap = {
    mapId: entityName + 'Map',
    idProperty: idFieldName,
    properties: [] as object[],
    collections: [] as object[],
    associations: [] as object[]
  };

  if (isInternalCall) {
    entityMetadata = {
      ...entityMetadata,
      '_id': 'string'
    }
  }

  Object.entries(entityMetadata).forEach(([fieldName, fieldTypeName]: [string, any]) => {
    const { baseTypeName, isArrayType } = getTypeInfoForTypeName(fieldTypeName);

    if (isArrayType && isEntityTypeName(baseTypeName)) {
      // noinspection DuplicatedCode
      if (shouldIncludeField(fieldName, fieldPath, projection)) {
        const relationEntityName = baseTypeName;

        resultMap.collections.push({
          name: fieldName,
          mapId: relationEntityName + 'Map',
          // columnPrefix: relationEntityName.toLowerCase() + '_'
          columnPrefix: tablePath + '_' + fieldName.toLowerCase() + '_'
        });

        updateResultMaps(
          (Types as any)[relationEntityName],
          Types,
          resultMaps,
          projection,
          fieldPath + fieldName + '.',
          isInternalCall,
          {},
          entityClassOrName as Function,
          tablePath + '_' + fieldName.toLowerCase()
        );
      }
    } else if (isEntityTypeName(baseTypeName)) {
      // noinspection DuplicatedCode
      if (shouldIncludeField(fieldName, fieldPath, projection)) {
        const relationEntityName = baseTypeName;

        resultMap.associations.push({
          name: fieldName,
          mapId: relationEntityName + 'Map',
          columnPrefix: tablePath + '_' + fieldName.toLowerCase() + '_'
        });

        updateResultMaps(
          (Types as any)[relationEntityName],
          Types,
          resultMaps,
          projection,
          fieldPath + fieldName + '.',
          isInternalCall,
          {},
          entityClassOrName as Function,
          tablePath + '_' + fieldName.toLowerCase()
        );
      }
    } else if (isArrayType) {
      if (shouldIncludeField(fieldName, fieldPath, projection)) {
        const relationEntityName = tablePath + '_' + fieldName.toLowerCase();

        resultMap.collections.push({
          name: fieldName,
          mapId: relationEntityName + 'Map',
          columnPrefix: relationEntityName + '_'
        });

        updateResultMaps(
          relationEntityName,
          Types,
          resultMaps,
          projection,
          fieldPath + fieldName + '.',
          isInternalCall,
          {
            id: 'integer',
            [fieldName.slice(0, -1)]: 'integer'
          },
          entityClassOrName as Function,
          tablePath + '_' + fieldName.toLowerCase()
        );
      }
    } else if (
      ((!ParentEntityClass && fieldName !== '_id') || (ParentEntityClass && fieldName !== 'id')) &&
      shouldIncludeField(fieldName, fieldPath, projection)
    ) {
      resultMap.properties.push({ name: fieldName, column: fieldName.toLowerCase() });
    }
  });

  resultMaps.push(resultMap);
}

export default function createResultMaps(
  entityClass: Function,
  Types: object,
  projection: Projection,
  isInternalCall: boolean
) {
  const resultMaps: any[] = [];
  updateResultMaps(entityClass, Types, resultMaps, projection, '', isInternalCall);
  return resultMaps;
}
