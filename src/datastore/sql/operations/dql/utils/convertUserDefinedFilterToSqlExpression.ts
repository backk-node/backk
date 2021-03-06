import UserDefinedFilter from '../../../../../types/userdefinedfilters/UserDefinedFilter';
import SqlInFilter from '../../../filters/SqlInFilter';
import SqlNotInFilter from '../../../filters/SqlNotInFilter';

export default function convertUserDefinedFilterToSqlExpression(
  { subEntityPath, fieldName, fieldFunction, operator, value, orFilters }: UserDefinedFilter,
  index: number | string
): string {
  let fieldExpression = fieldName;

  if (fieldFunction) {
    if (
      fieldFunction !== 'YEAR' &&
      fieldFunction !== 'MONTH' &&
      fieldFunction !== 'DAY' &&
      fieldFunction != 'WEEKDAY' &&
      fieldFunction != 'WEEK' &&
      fieldFunction !== 'QUARTER' &&
      fieldFunction !== 'HOUR' &&
      fieldFunction !== 'MINUTE' &&
      fieldFunction !== 'SECOND'
    ) {
      fieldExpression = fieldFunction + '(' + fieldName + ')';
    } else {
      fieldExpression = 'EXTRACT(' + fieldFunction + ' FROM ' + fieldName + ')';
    }
  }

  if (operator === 'IN' && fieldName) {
    return new SqlInFilter(fieldName, value, subEntityPath ?? '', fieldExpression).toSqlString();
  } else if (operator === 'NOT IN' && fieldName) {
    return new SqlNotInFilter(fieldName, value, subEntityPath ?? '', fieldExpression).toSqlString();
  } else if (operator === 'IS NULL' || operator === 'IS NOT NULL') {
    return `${fieldExpression} ${operator}`;
  } else if (!operator) {
    return `${fieldExpression} = :${(subEntityPath ?? '').replace('.', 'xx')}xx${fieldName}${index}`;
  } else if (operator === 'OR' && orFilters) {
    return (
      ' (' +
      orFilters
        .map((orFilter, orFilterIndex: number) =>
          convertUserDefinedFilterToSqlExpression({ ...orFilter, subEntityPath }, `${index}xx${orFilterIndex}`)
        )
        .join(' OR ') +
      ') '
    );
  }

  return `${fieldExpression} ${operator} :${(subEntityPath ?? '').replace('.', 'xx')}xx${fieldName}${index}`;
}
