import MongoDbQuery from "./MongoDbQuery";

export default function convertFilterObjectToMongoDbQueries(filters: object): MongoDbQuery<any>[] {
  return Object.entries(filters).map(([fieldPathName, fieldValue]) => {
    const lastDotPosition = fieldPathName.lastIndexOf('.');

    if (lastDotPosition !== -1) {
      const fieldName = fieldPathName.slice(lastDotPosition + 1);
      const subEntityPath = fieldPathName.slice(0, lastDotPosition);
      return new MongoDbQuery({ [fieldName]: fieldValue }, subEntityPath);
    }

    return new MongoDbQuery({ [fieldPathName]: fieldValue });
  });
}
