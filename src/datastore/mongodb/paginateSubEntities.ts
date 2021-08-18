import Pagination from '../../types/postqueryoperations/Pagination';
import getClassPropertyNameToPropertyTypeNameMap from '../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import getTypeInfoForTypeName from '../../utils/type/getTypeInfoForTypeName';
import isEntityTypeName from '../../utils/type/isEntityTypeName';
import { JSONPath } from 'jsonpath-plus';
import typePropertyAnnotationContainer from '../../decorators/typeproperty/typePropertyAnnotationContainer';
import EntityCountRequest from '../../types/EntityCountRequest';

function paginateRows<T>(
  rows: T[],
  pagination: Pagination,
  subEntityPath: string,
  subEntityJsonPath: string,
  propertyName: string,
  entityCountRequests?: EntityCountRequest[]
) {
  const shouldReturnEntityCount = !!entityCountRequests?.find(
    (entityCountRequest) =>
      entityCountRequest.subEntityPath === '' || entityCountRequest.subEntityPath === '*'
  );

  rows.forEach((row: any) => {
    const [subEntitiesParent] = JSONPath({ json: row, path: subEntityJsonPath + propertyName + '^' });

    if (subEntitiesParent && Array.isArray(subEntitiesParent[propertyName])) {
      if (
        pagination.pageNumber !== 1 ||
        (pagination.pageNumber === 1 &&
          subEntitiesParent.length > pagination.pageNumber * pagination.pageSize)
      ) {
        subEntitiesParent[propertyName] = subEntitiesParent[propertyName].slice(
          (pagination.pageNumber - 1) * pagination.pageSize,
          pagination.pageNumber * pagination.pageSize
        );
      }

      if (shouldReturnEntityCount) {
        const count = subEntitiesParent[propertyName].length;
        subEntitiesParent[propertyName].forEach((entity: any) => {
          entity._count = count;
        });
      }
    }
  });
}

export default function paginateSubEntities<T>(
  rows: T[],
  paginations: Pagination[] | undefined,
  EntityClass: new () => any,
  Types: any,
  entityCountRequests?: EntityCountRequest[],
  subEntityPath = '',
  subEntityJsonPath = '$.'
) {
  const entityClassPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap(EntityClass);

  Object.entries(entityClassPropertyNameToPropertyTypeNameMap).forEach(([propertyName, propertyTypeName]) => {
    const { baseTypeName, isArrayType } = getTypeInfoForTypeName(propertyTypeName);

    if (
      isEntityTypeName(baseTypeName) &&
      isArrayType &&
      !typePropertyAnnotationContainer.isTypePropertyManyToMany(EntityClass, propertyName)
    ) {
      let pagination = paginations?.find((pagination) => {
        const wantedSubEntityPath = subEntityPath ? subEntityPath + '.' + propertyName : propertyName;
        return pagination.subEntityPath === wantedSubEntityPath;
      });

      if (!pagination) {
        pagination = paginations?.find((pagination) => pagination.subEntityPath === '*');
      }

      if (pagination) {
        paginateRows(rows, pagination, subEntityPath, subEntityJsonPath, propertyName, entityCountRequests);
      }

      paginateSubEntities(
        rows,
        paginations,
        Types[baseTypeName],
        Types,
        entityCountRequests,
        subEntityPath + propertyName + '.',
        subEntityJsonPath + propertyName + '[*].'
      );
    }
  });
}
