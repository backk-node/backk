import { Projection } from '../../../../../types/postqueryoperations/Projection';
import SqlExpression from '../../../expressions/SqlExpression';
import UserDefinedFilter from '../../../../../types/userdefinedfilters/UserDefinedFilter';
import AbstractSqlDbManager from '../../../../AbstractSqlDbManager';
import SortBy from '../../../../../types/postqueryoperations/SortBy';
import Pagination from '../../../../../types/postqueryoperations/Pagination';
export default function getJoinClauses(dbManager: AbstractSqlDbManager, subEntityPath: string, projection: Projection, filters: SqlExpression[] | UserDefinedFilter[] | undefined, sortBys: SortBy[], paginations: Pagination[], EntityClass: new () => any, Types: object, resultOuterSortBys: string[], isInternalCall: boolean, tableAliasPath?: string, RootEntityClass?: new () => any): string;
