import forEachAsyncParallel from '../../../../utils/forEachAsyncParallel';
import typePropertyAnnotationContainer from '../../../../decorators/typeproperty/typePropertyAnnotationContainer';
import AbstractDbManager, { Field } from '../../../AbstractDbManager';
import getEnumSqlColumnType from './utils/getEnumSqlColumnType';
import getSqlColumnType from './utils/getSqlColumnType';
import setSubEntityInfo from './utils/setSubEntityInfo';
import createArrayValuesTable from './utils/createArrayValuesTable';
import addArrayValuesTableJoinSpec from './utils/addArrayValuesTableJoinSpec';
import getClassPropertyNameToPropertyTypeNameMap from '../../../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import getTypeInfoForTypeName from '../../../../utils/type/getTypeInfoForTypeName';
import isEntityTypeName from '../../../../utils/type/isEntityTypeName';
import isEnumTypeName from '../../../../utils/type/isEnumTypeName';
import entityAnnotationContainer from '../../../../decorators/entity/entityAnnotationContainer';

export default async function tryAlterTable(
  dbManager: AbstractDbManager,
  entityName: string,
  EntityClass: Function,
  schema: string | undefined,
  databaseFields: Field[]
) {
  const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass as any);

  await forEachAsyncParallel(
    Object.entries(entityMetadata),
    async ([fieldName, fieldTypeName]: [any, any]) => {
      if (typePropertyAnnotationContainer.isTypePropertyTransient(EntityClass, fieldName)) {
        return;
      }

      const doesFieldExistInDatabase = !!databaseFields.find(
        (field) => field.name.toLowerCase() === fieldName.toLowerCase()
      );

      if (!doesFieldExistInDatabase) {
        let tableName = entityName.toLowerCase();

        if (entityAnnotationContainer.entityNameToTableNameMap[entityName]) {
          tableName = entityAnnotationContainer.entityNameToTableNameMap[entityName].toLowerCase();
        }

        let alterTableStatement = `ALTER TABLE ${schema?.toLowerCase()}.${tableName} ADD `;
        const { baseTypeName, isArrayType } = getTypeInfoForTypeName(fieldTypeName);
        let sqlColumnType = getSqlColumnType(dbManager, EntityClass, fieldName, baseTypeName);

        if (!sqlColumnType && isEnumTypeName(baseTypeName)) {
          sqlColumnType = getEnumSqlColumnType(dbManager, baseTypeName);
        }

        if (!sqlColumnType && isEntityTypeName(baseTypeName)) {
          setSubEntityInfo(entityName, EntityClass, fieldName, baseTypeName, isArrayType);
        } else if (isArrayType) {
          await createArrayValuesTable(schema, entityName, fieldName, sqlColumnType ?? '', dbManager);
          const foreignIdFieldName = entityName.charAt(0).toLowerCase() + entityName.slice(1) + 'Id';
          addArrayValuesTableJoinSpec(entityName, fieldName, foreignIdFieldName);
        } else {
          const isUnique = typePropertyAnnotationContainer.isTypePropertyUnique(EntityClass, fieldName);

          alterTableStatement += fieldName.toLowerCase() + ' ' + sqlColumnType + (isUnique ? ' UNIQUE' : '');

          await dbManager.tryExecuteSqlWithoutCls(alterTableStatement);
        }
      }

      const { baseTypeName, isArrayType } = getTypeInfoForTypeName(fieldTypeName);
      const sqlColumnType = getSqlColumnType(dbManager, EntityClass, fieldName, baseTypeName);

      if (
        fieldName !== '_id' &&
        !isArrayType &&
        ((sqlColumnType === 'BIGINT' && fieldName !== 'id' && !fieldName.endsWith('Id')) ||
          sqlColumnType?.startsWith('VARCHAR'))
      ) {
        let tableName = entityName.toLowerCase();

        if (entityAnnotationContainer.entityNameToTableNameMap[entityName]) {
          tableName = entityAnnotationContainer.entityNameToTableNameMap[entityName].toLowerCase();
        }

        const isUnique = typePropertyAnnotationContainer.isTypePropertyUnique(EntityClass, fieldName);

        const alterTableStatement = dbManager.getModifyColumnStatement(
          schema,
          tableName,
          fieldName,
          sqlColumnType,
          isUnique
        );

        await dbManager.tryExecuteSqlWithoutCls(alterTableStatement, undefined, true, false);
      }
    }
  );
}
