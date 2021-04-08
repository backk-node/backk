import AbstractDbManager from '../../../AbstractDbManager';
import tryAlterTable from './tryAlterTable';
import tryCreateTable from './tryCreateTable';
import entityAnnotationContainer from "../../../../decorators/entity/entityAnnotationContainer";

export default async function tryAlterOrCreateTable(
  dbManager: AbstractDbManager,
  entityName: string,
  EntityClass: Function,
  schema: string | undefined
) {
  let fields;
  let isPhysicalTable = true

  try {
    let tableName = entityName.toLowerCase();

    if (entityAnnotationContainer.entityNameToTableNameMap[entityName]) {
      tableName = entityAnnotationContainer.entityNameToTableNameMap[entityName].toLowerCase();
      isPhysicalTable = false;
    }

    fields = await dbManager.tryExecuteSqlWithoutCls(
      `SELECT * FROM ${schema?.toLowerCase()}.${tableName} LIMIT 1`,
      undefined,
      false
    );
  } catch (error) {
    await tryCreateTable(dbManager, entityName, EntityClass, schema, isPhysicalTable);
    return;
  }

  await tryAlterTable(dbManager, entityName, EntityClass, schema, fields);
}
