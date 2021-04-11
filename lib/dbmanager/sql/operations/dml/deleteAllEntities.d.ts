import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
export default function deleteAllEntities<T>(dbManager: AbstractSqlDbManager, EntityClass: new () => T, isRecursive?: boolean): PromiseErrorOr<null>;
