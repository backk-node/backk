import AbstractDbManager from '../../../../AbstractDbManager';

export default async function createArrayValuesTable(
  schema: string | undefined,
  entityName: string,
  fieldName: string,
  sqlColumnType: string,
  dbManager: AbstractDbManager
) {
  const foreignIdFieldName = entityName.charAt(0).toLowerCase() + entityName.slice(1) + 'Id';
  const arrayValueFieldName = fieldName.slice(0, -1);
  const arrayValuesTableName = entityName + '_' + arrayValueFieldName;

  try {
    await dbManager.tryExecuteSqlWithoutCls(
      `SELECT * FROM ${schema?.toLowerCase()}.${arrayValuesTableName.toLowerCase()}`,
      undefined,
      false
    );
  } catch {
    let createAdditionalTableStatement = `CREATE TABLE ${schema?.toLowerCase()}.${arrayValuesTableName.toLowerCase()} (`;

    createAdditionalTableStatement +=
      'id BIGINT, ' +
      foreignIdFieldName.toLowerCase() +
      ' BIGINT, ' +
      arrayValueFieldName.toLowerCase() +
      ' ' +
      sqlColumnType +
      ', PRIMARY KEY(' +
      foreignIdFieldName.toLowerCase() +
      ', id), FOREIGN KEY(' +
      foreignIdFieldName.toLowerCase() +
      ') REFERENCES ' +
      schema?.toLowerCase() +
      '.' +
      foreignIdFieldName.toLowerCase().slice(0, -2) +
      '(_id))';

    await dbManager.tryExecuteSqlWithoutCls(createAdditionalTableStatement);
  }
}
