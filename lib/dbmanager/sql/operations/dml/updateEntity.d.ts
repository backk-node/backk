import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import { RecursivePartial } from '../../../../types/RecursivePartial';
import { BackkEntity } from '../../../../types/entities/BackkEntity';
import { PostHook } from '../../../hooks/PostHook';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import { EntityPreHook } from '../../../hooks/EntityPreHook';
import { PreHook } from "../../../hooks/PreHook";
export default function updateEntity<T extends BackkEntity>(dbManager: AbstractSqlDbManager, { _id, id, ...restOfEntity }: RecursivePartial<T> & {
    _id: string;
}, EntityClass: new () => T, preHooks?: PreHook | PreHook[], entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[], postHook?: PostHook<T>, postQueryOperations?: PostQueryOperations, isRecursiveCall?: boolean): PromiseErrorOr<null>;
