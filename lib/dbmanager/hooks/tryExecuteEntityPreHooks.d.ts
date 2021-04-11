import { BackkEntity } from '../../types/entities/BackkEntity';
import { SubEntity } from '../../types/entities/SubEntity';
import { EntityPreHook } from './EntityPreHook';
export default function tryExecuteEntityPreHooks<T extends BackkEntity | SubEntity>(preHooks: EntityPreHook<T> | EntityPreHook<T>[], entity: T): Promise<void>;
