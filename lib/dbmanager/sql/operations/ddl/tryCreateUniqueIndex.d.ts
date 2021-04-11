import AbstractDbManager from '../../../AbstractDbManager';
export default function tryCreateUniqueIndex(dbManager: AbstractDbManager, indexName: string, schema: string | undefined, indexFields: string[]): Promise<void>;
