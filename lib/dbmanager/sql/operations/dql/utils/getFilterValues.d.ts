import SqlExpression from '../../../expressions/SqlExpression';
import UserDefinedFilter from '../../../../../types/userdefinedfilters/UserDefinedFilter';
export default function getFilterValues<T>(filters?: (SqlExpression | UserDefinedFilter)[]): object;
