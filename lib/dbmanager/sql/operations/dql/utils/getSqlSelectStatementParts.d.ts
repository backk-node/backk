import AbstractSqlDbManager from '../../../../AbstractSqlDbManager';
import { PostQueryOperations } from '../../../../../types/postqueryoperations/PostQueryOperations';
import SqlExpression from '../../../expressions/SqlExpression';
import UserDefinedFilter from '../../../../../types/userdefinedfilters/UserDefinedFilter';
export default function getSqlSelectStatementParts<T>(dbManager: AbstractSqlDbManager, { sortBys, paginations, ...projection }: PostQueryOperations, EntityClass: new () => T, filters?: SqlExpression[] | UserDefinedFilter[], isInternalCall?: boolean): {
    columns: string;
    joinClauses: string;
    rootWhereClause: string;
    filterValues: object;
    rootSortClause: string;
    rootPaginationClause: string;
    outerSortClause: string;
};
