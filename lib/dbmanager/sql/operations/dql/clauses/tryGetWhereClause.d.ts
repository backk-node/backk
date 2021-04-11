import SqlExpression from '../../../expressions/SqlExpression';
import UserDefinedFilter from '../../../../../types/userdefinedfilters/UserDefinedFilter';
import AbstractSqlDbManager from '../../../../AbstractSqlDbManager';
export default function tryGetWhereClause<T>(dbManager: AbstractSqlDbManager, subEntityPath: string, filters?: (SqlExpression | UserDefinedFilter)[]): string;
