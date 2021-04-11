import { PreHook } from './PreHook';
import { BackkEntity } from '../../types/entities/BackkEntity';
import { SubEntity } from '../../types/entities/SubEntity';
export default function tryExecutePreHooks<T extends BackkEntity | SubEntity>(preHooks: PreHook | PreHook[]): Promise<void>;
