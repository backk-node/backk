import { Projection } from '../../../../../../types/postqueryoperations/Projection';

export default function shouldIncludeField(
  fieldName: string,
  fieldPath: string,
  { includeResponseFields, excludeResponseFields }: Projection
): boolean {
  let shouldIncludeField = true;
  const fullFieldPath =
    fieldPath.endsWith('.') || !fieldPath ? fieldPath + fieldName : fieldPath + (fieldName ? '.' : '') + fieldName;

  if (includeResponseFields && includeResponseFields.length > 0) {
    shouldIncludeField = !!includeResponseFields.find((includeResponseField) => {
      if (fullFieldPath.length >= includeResponseField.length && fullFieldPath.includes('.')) {
        return includeResponseField === fullFieldPath.slice(0, includeResponseField.length);
      } else if (
        includeResponseField.length > fullFieldPath.length &&
        includeResponseField.startsWith(fullFieldPath + '.')
      ) {
        return true;
      } else {
        return includeResponseField === fullFieldPath;
      }
    });
  }

  if (excludeResponseFields && excludeResponseFields.length > 0) {
    const shouldExcludeField = !!excludeResponseFields.find(
      (excludeResponseField) => excludeResponseField === fullFieldPath.slice(0, excludeResponseField.length)
    );

    shouldIncludeField = shouldExcludeField ? false : shouldIncludeField;
  }

  return shouldIncludeField;
}
