import MongoDbQuery from "./MongoDbQuery";

export default function convertMongoDbQueriesToMatchExpression(filters: Array<MongoDbQuery<any>>) {
  return filters.reduce((matchExpression, mongoDbQuery) => {
    return {
      ...matchExpression,
      ...mongoDbQuery.filterQuery
    }
  }, {});
}
