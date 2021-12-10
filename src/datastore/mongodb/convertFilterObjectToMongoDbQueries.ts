import MongoDbFilter from "./MongoDbFilter";

export default function convertFilterObjectToMongoDbQueries(filters: object): MongoDbFilter<any>[] {
  return Object.entries(filters).map(([fieldPathName, fieldValue]) => {
    const lastDotPosition = fieldPathName.lastIndexOf('.');

    if (lastDotPosition !== -1) {
      const fieldName = fieldPathName.slice(lastDotPosition + 1);
      const subEntityPath = fieldPathName.slice(0, lastDotPosition);
      return new MongoDbFilter({ [fieldName]: fieldValue }, subEntityPath);
    }

    return new MongoDbFilter({ [fieldPathName]: fieldValue });
  });
}
