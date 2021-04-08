export default function getIncludeFieldsMap(includeResponseFields?: string[]): object {
  return includeResponseFields
    ? includeResponseFields.reduce(
      (includeFieldsMap: object, includeResponseField: string) => ({
        ...includeFieldsMap,
        [includeResponseField]: 1
      }),
      {}
    )
    : {};
}
