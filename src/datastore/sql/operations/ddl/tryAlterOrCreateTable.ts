import { DataStore } from '../../../DataStore';
import tryAlterTable from './tryAlterTable';
import tryCreateTable from './tryCreateTable';
import entityAnnotationContainer from "../../../../decorators/entity/entityAnnotationContainer";

export default async function tryAlterOrCreateTable(
  dataStore: DataStore,
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

    fields = await dataStore.tryExecuteSqlWithoutCls(
      `SELECT * FROM ${schema?.toLowerCase()}.${tableName} LIMIT 1`,
      undefined,
      false
    );
  } catch (error) {
    await tryCreateTable(dataStore, entityName, EntityClass, schema, isPhysicalTable);
    return;
  }

  await tryAlterTable(dataStore, entityName, EntityClass, schema, fields);
}
