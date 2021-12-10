import MongoDbFilter from "./MongoDbFilter";

export default function convertMongoDbQueriesToMatchExpression(filters: Array<MongoDbFilter<any>>) {
  return filters.reduce((matchExpression, mongoDbQuery) => {
    return {
      ...matchExpression,
      ...mongoDbQuery.filterQuery
    }
  }, {});
}
