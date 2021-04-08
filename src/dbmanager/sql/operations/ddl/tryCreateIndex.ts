import AbstractDbManager from '../../../AbstractDbManager';
import entityAnnotationContainer from '../../../../decorators/entity/entityAnnotationContainer';

export default async function tryCreateIndex(
  dbManager: AbstractDbManager,
  indexName: string,
  schema: string | undefined,
  indexFields: string[],
  isUnique = false
) {
  const indexUsingOption = entityAnnotationContainer.indexNameToUsingOptionMap[indexName];
  const additionalSqlCreateIndexStatementOptions =
    entityAnnotationContainer.indexNameToAdditionalSqlCreateIndexStatementOptionsMap[indexName];

  const lowerCaseIndexFields = indexFields.map(indexField => indexField.toLowerCase());
  const sortOrderStr = indexFields.length === 1 ? entityAnnotationContainer.indexNameToSortOrderMap[indexName] : '';

  try {
    const createIndexStatement = `CREATE ${
      isUnique ? 'UNIQUE' : ''
    }INDEX ${indexName.replace(':', '_').toLowerCase()} ON ${schema?.toLowerCase()}.${indexName.split(':')[0].toLowerCase()} ${
      indexUsingOption ? 'USING ' + indexUsingOption : ''
    }(${lowerCaseIndexFields.join(', ')} ${sortOrderStr}) ${additionalSqlCreateIndexStatementOptions ?? ''}`;

    await dbManager.tryExecuteSqlWithoutCls(createIndexStatement, undefined, false, true);
  } catch(error) {
    // NOOP
  }
}
