import joinjs from 'join-js';
import transformNonEntityArrays from './transformNonEntityArrays';
import decryptEntities from '../../../../../crypt/decryptEntities';
import createResultMaps from './createResultMaps';
import removeSingleSubEntitiesWithNullProperties from './removeSingleSubEntitiesWithNullProperties';
import { PostQueryOperations } from '../../../../../types/postqueryoperations/PostQueryOperations';
import Pagination from '../../../../../types/postqueryoperations/Pagination';
import convertTinyIntegersToBooleans from './convertTinyIntegersToBooleans';
import AbstractDbManager from '../../../../AbstractDbManager';
import { Values } from "../../../../../constants/constants";

const parsedRowProcessingBatchSize = parseInt(process.env.ROW_PROCESSING_BATCH_SIZE ?? '500', 10);
const ROW_PROCESSING_BATCH_SIZE = isNaN(parsedRowProcessingBatchSize) ? Values._500 : parsedRowProcessingBatchSize;

function getMappedRows(
  rows: any[],
  resultMaps: any[],
  EntityClass: new () => any,
  dbManager: AbstractDbManager,
  startIndex?: number,
  endIndex?: number
) {
  const mappedRows = joinjs.map(
    startIndex && endIndex ? rows.slice(startIndex, endIndex < rows.length ? endIndex : undefined) : rows,
    resultMaps,
    EntityClass.name + 'Map',
    EntityClass.name.toLowerCase() + '_'
  );

  const Types = dbManager.getTypes();
  transformNonEntityArrays(mappedRows, EntityClass, Types);

  if (dbManager.shouldConvertTinyIntegersToBooleans()) {
    convertTinyIntegersToBooleans(mappedRows, EntityClass, Types);
  }

  decryptEntities(mappedRows, EntityClass, Types);
  removeSingleSubEntitiesWithNullProperties(mappedRows);
  return mappedRows;
}

export default function transformRowsToObjects<T>(
  rows: any[],
  EntityClass: { new (): T },
  { paginations, includeResponseFields, excludeResponseFields }: PostQueryOperations,
  dbManager: AbstractDbManager,
  isInternalCall = false
) {
  const resultMaps = createResultMaps(EntityClass, dbManager.getTypes(), {
    includeResponseFields,
    excludeResponseFields
  }, isInternalCall);

  let mappedRows: any[] = [];

  if (rows.length > ROW_PROCESSING_BATCH_SIZE) {
    Array(Math.round(rows.length / ROW_PROCESSING_BATCH_SIZE))
      .fill(1)
      .forEach((rowBatch, index) => {
        setImmediate(() => {
          mappedRows = mappedRows.concat(
            getMappedRows(
              rows,
              resultMaps,
              EntityClass,
              dbManager,
              index * ROW_PROCESSING_BATCH_SIZE,
              (index + 1) * ROW_PROCESSING_BATCH_SIZE
            )
          );
        });
      });
  } else {
    mappedRows = getMappedRows(rows, resultMaps, EntityClass, dbManager);
  }

  if (!paginations) {
    // noinspection AssignmentToFunctionParameterJS
    paginations = [new Pagination('*', 1, Values._50)];
  }

  let rootPagination = paginations.find((pagination) => pagination.subEntityPath === '');

  if (!rootPagination) {
    rootPagination = paginations.find((pagination) => pagination.subEntityPath === '*');
  }

  if (rootPagination && mappedRows.length > rootPagination.pageSize) {
    mappedRows = mappedRows.slice(0, rootPagination.pageSize);
  }

  return mappedRows;
}
