import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
export default function getEntitiesWhere<T>(dbManager: AbstractSqlDbManager, fieldPathName: string, fieldValue: any, EntityClass: new () => T, postQueryOperations?: PostQueryOperations): PromiseErrorOr<T[]>;
