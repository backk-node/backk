import SortBy from '../../../../../types/postqueryoperations/SortBy';
import AbstractSqlDbManager from '../../../../AbstractSqlDbManager';
export default function tryGetOrderByClause<T>(dbManager: AbstractSqlDbManager, subEntityPath: string, sortBys: SortBy[], EntityClass: new () => T, Types: object, tableAlias?: string): string;
