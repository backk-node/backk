import SqlEquals from '../../../expressions/SqlEquals';

export default function convertFilterObjectToSqlEquals(filters: object): SqlEquals<any>[] {
  return Object.entries(filters).map(([fieldPathName, fieldValue]) => {
    const lastDotPosition = fieldPathName.lastIndexOf('.');

    if (lastDotPosition !== -1) {
      const fieldName = fieldPathName.slice(lastDotPosition + 1);
      const subEntityPath = fieldPathName.slice(0, lastDotPosition);
      return new SqlEquals({ [fieldName]: fieldValue }, subEntityPath);
    }

    return new SqlEquals({ [fieldPathName]: fieldValue });
  });
}
