import Pagination from '../../types/postqueryoperations/Pagination';
export default function paginateSubEntities<T>(rows: T[], paginations: Pagination[] | undefined, EntityClass: new () => any, Types: any, subEntityPath?: string, subEntityJsonPath?: string): void;
