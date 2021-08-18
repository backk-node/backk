export default function getExcludeFieldsMap(excludeResponseFields?: string[]): object {
  return excludeResponseFields
    ? excludeResponseFields.reduce(
      (excludeFieldsMap: object, excludeResponseField: string) => ({
        ...excludeFieldsMap,
        [excludeResponseField]: 0
      }),
      {}
    )
    : {};
}
