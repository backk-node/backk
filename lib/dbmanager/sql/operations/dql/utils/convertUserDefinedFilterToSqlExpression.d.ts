import UserDefinedFilter from '../../../../../types/userdefinedfilters/UserDefinedFilter';
export default function convertUserDefinedFilterToSqlExpression({ subEntityPath, fieldName, fieldFunction, operator, value, orFilters }: UserDefinedFilter, index: number | string): string;
