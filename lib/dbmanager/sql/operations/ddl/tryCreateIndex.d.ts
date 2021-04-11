import AbstractDbManager from '../../../AbstractDbManager';
export default function tryCreateIndex(dbManager: AbstractDbManager, indexName: string, schema: string | undefined, indexFields: string[], isUnique?: boolean): Promise<void>;
