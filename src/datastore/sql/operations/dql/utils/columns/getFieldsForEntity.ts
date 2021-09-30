import { Projection } from '../../../../../../types/postqueryoperations/Projection';
import getClassPropertyNameToPropertyTypeNameMap from '../../../../../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import typePropertyAnnotationContainer from '../../../../../../decorators/typeproperty/typePropertyAnnotationContainer';
import shouldIncludeField from './shouldIncludeField';
import getTypeInfoForTypeName from '../../../../../../utils/type/getTypeInfoForTypeName';
import isEntityTypeName from '../../../../../../utils/type/isEntityTypeName';
import AbstractSqlDataStore from '../../../../../AbstractSqlDataStore';
import EntityCountRequest from "../../../../../../types/EntityCountRequest";
import isPropertyReadDenied from "../../../../../../utils/type/isPropertyReadDenied";

export default function getFieldsForEntity(
  dataStore: AbstractSqlDataStore,
  fields: string[],
  EntityClass: Function,
  Types: object,
  projection: Projection,
  fieldPath: string,
  entityCountRequests?: EntityCountRequest[],
  isInternalCall = false,
  tableAlias = EntityClass.name.toLowerCase()
) {
  let entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap(
    EntityClass as any
  );

  if (isInternalCall) {
    entityPropertyNameToPropertyTypeNameMap = {
      ...entityPropertyNameToPropertyTypeNameMap,
      _id: 'string'
    }
  }

  const shouldReturnEntityCount = !!entityCountRequests?.find(
    (entityCountRequest) =>
      entityCountRequest.subEntityPath === fieldPath || entityCountRequest.subEntityPath === '*'
  );

  if (shouldReturnEntityCount) {
    entityPropertyNameToPropertyTypeNameMap = {
      ...entityPropertyNameToPropertyTypeNameMap,
      _count: 'integer'
    }
  }

  Object.entries(entityPropertyNameToPropertyTypeNameMap).forEach(
    ([entityPropertyName, entityPropertyTypeName]: [string, any]) => {
      if (
        (!isInternalCall &&
          isPropertyReadDenied(EntityClass, entityPropertyName)) ||
        typePropertyAnnotationContainer.isTypePropertyTransient(EntityClass, entityPropertyName)
      ) {
        return;
      }

      const { baseTypeName, isArrayType } = getTypeInfoForTypeName(entityPropertyTypeName);

      if (isEntityTypeName(baseTypeName)) {
        getFieldsForEntity(
          dataStore,
          fields,
          (Types as any)[baseTypeName],
          Types,
          projection,
          fieldPath + entityPropertyName + '.',
          entityCountRequests,
          isInternalCall,
          tableAlias + '_' + entityPropertyName.toLowerCase()
        );
      } else if (isArrayType) {
        if (
          shouldIncludeField(entityPropertyName, fieldPath, projection, false) &&
          !projection.includeResponseFields?.[0]?.endsWith('._id')
        ) {
          const idFieldName = (
            EntityClass.name.charAt(0).toLowerCase() +
            EntityClass.name.slice(1) +
            'Id'
          ).toLowerCase();

          const relationEntityName = (tableAlias + '_' + entityPropertyName).toLowerCase();

          fields.push(
            `${dataStore.schema}_${relationEntityName}.${idFieldName} AS ${relationEntityName}_${idFieldName}`
          );

          const singularFieldName = entityPropertyName.slice(0, -1).toLowerCase();

          fields.push(
            `${dataStore.schema}_${relationEntityName}.${singularFieldName} AS ${relationEntityName}_${singularFieldName}`
          );

          fields.push(`${dataStore.schema}_${relationEntityName}.id AS ${relationEntityName}_id`);
        }
      } else {
        if (shouldIncludeField(entityPropertyName, fieldPath, projection, shouldReturnEntityCount)) {
          if (
            entityPropertyName === '_id' ||
            entityPropertyName === 'id' ||
            entityPropertyName.endsWith('Id')
          ) {
            fields.push(
              `CAST(${
                dataStore.schema
              }_${tableAlias}.${entityPropertyName.toLowerCase()} AS ${dataStore.getIdColumnCastType()}) AS ${tableAlias}_${entityPropertyName.toLowerCase()}`
            );
          } else {
            fields.push(
              `${
                dataStore.schema
              }_${tableAlias}.${entityPropertyName.toLowerCase()} AS ${tableAlias}_${entityPropertyName.toLowerCase()}`
            );
          }
        }
      }
    }
  );
}
