import SqlEqFilter from '../../../filters/SqlEqFilter';

export default function convertFilterObjectToSqlEquals(filters: object): SqlEqFilter<any>[] {
  return Object.entries(filters).map(([fieldPathName, fieldValue]) => {
    const lastDotPosition = fieldPathName.lastIndexOf('.');

    if (lastDotPosition !== -1) {
      const fieldName = fieldPathName.slice(lastDotPosition + 1);
      const subEntityPath = fieldPathName.slice(0, lastDotPosition);
      return new SqlEqFilter({ [fieldName]: fieldValue }, subEntityPath);
    }

    return new SqlEqFilter({ [fieldPathName]: fieldValue });
  });
}
