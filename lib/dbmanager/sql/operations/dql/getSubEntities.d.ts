import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
export default function getSubEntities<T extends object, U extends object>(dbManager: AbstractSqlDbManager, _id: string, subEntityPath: string, EntityClass: new () => T, postQueryOperations?: PostQueryOperations, responseMode?: 'first' | 'all'): PromiseErrorOr<U[]>;
