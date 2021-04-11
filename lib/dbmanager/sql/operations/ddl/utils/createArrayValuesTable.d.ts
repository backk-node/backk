import AbstractDbManager from '../../../../AbstractDbManager';
export default function createArrayValuesTable(schema: string | undefined, entityName: string, fieldName: string, sqlColumnType: string, dbManager: AbstractDbManager): Promise<void>;
