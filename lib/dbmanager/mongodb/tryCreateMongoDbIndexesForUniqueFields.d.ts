import MongoDbManager from '../MongoDbManager';
export default function tryCreateMongoDbIndexesForUniqueFields(dbManager: MongoDbManager, EntityClass: Function): Promise<void>;
