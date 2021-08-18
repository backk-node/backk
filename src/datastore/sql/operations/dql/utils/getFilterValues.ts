import SqlExpression from '../../../expressions/SqlExpression';
import UserDefinedFilter from '../../../../../types/userdefinedfilters/UserDefinedFilter';
import SqlInExpression from '../../../expressions/SqlInExpression';
import SqlNotInExpression from '../../../expressions/SqlNotInExpression';

function getUserDefinedFilterValues(
  filters: (SqlExpression | UserDefinedFilter)[],
  parentIndex?: number
): object {
  return filters
    .filter((filter) => filter instanceof UserDefinedFilter)
    .reduce((accumulatedFilterValues, filter, index) => {
      const userDefinedFilter = filter as UserDefinedFilter;
      if (userDefinedFilter.operator === 'OR') {
        return getUserDefinedFilterValues(
          userDefinedFilter.orFilters
            ? userDefinedFilter.orFilters.map((orFilter) => ({
                ...orFilter,
                subEntityPath: filter.subEntityPath
              }))
            : [],
          index
        );
      }

      if (!userDefinedFilter.fieldName) {
        throw new Error('fieldName not defined for user defined filter');
      }

      let finalIndexStr = index.toString();
      if (parentIndex !== undefined) {
        finalIndexStr = parentIndex + 'xx' + index;
      }

      let filterValues = {
        [(filter.subEntityPath?.replace('.', 'xx') ?? '') +
        'xx' +
        userDefinedFilter.fieldName +
        finalIndexStr]: userDefinedFilter.value
      };

      if (userDefinedFilter.operator === 'IN') {
        filterValues = new SqlInExpression(userDefinedFilter.fieldName, userDefinedFilter.value).getValues();
      } else if (userDefinedFilter.operator === 'NOT IN') {
        filterValues = new SqlNotInExpression(
          userDefinedFilter.fieldName,
          userDefinedFilter.value
        ).getValues();
      }

      return {
        ...accumulatedFilterValues,
        ...filterValues
      };
    }, {});
}

export default function getFilterValues<T>(filters?: (SqlExpression | UserDefinedFilter)[]): object {
  if (Array.isArray(filters)) {
    if (filters.length === 0) {
      return {};
    } else {
      const sqlExpressionFilterValues = filters
        .filter((filter) => filter instanceof SqlExpression)
        .reduce(
          (accumulatedFilterValues, filter) => ({
            ...accumulatedFilterValues,
            ...(filter as SqlExpression).getValues()
          }),
          {}
        );

      const userDefinedFilterValues = getUserDefinedFilterValues(filters);

      return {
        ...sqlExpressionFilterValues,
        ...userDefinedFilterValues
      };
    }
  }
  return {};
}
