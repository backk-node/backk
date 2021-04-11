import MongoDbManager from '../MongoDbManager';
export default function tryCreateMongoDbIndex(dbManager: MongoDbManager, indexName: string, schema: string | undefined, indexFields: string[], isUnique?: boolean): Promise<void>;
