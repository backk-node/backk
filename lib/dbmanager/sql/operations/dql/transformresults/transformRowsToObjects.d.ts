import { PostQueryOperations } from '../../../../../types/postqueryoperations/PostQueryOperations';
import AbstractDbManager from '../../../../AbstractDbManager';
export default function transformRowsToObjects<T>(rows: any[], EntityClass: {
    new (): T;
}, { paginations, includeResponseFields, excludeResponseFields }: PostQueryOperations, dbManager: AbstractDbManager, isInternalCall?: boolean): any[];
