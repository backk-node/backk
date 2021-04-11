import MongoDbQuery from "./MongoDbQuery";
export default function convertFilterObjectToMongoDbQueries(filters: object): MongoDbQuery<any>[];
