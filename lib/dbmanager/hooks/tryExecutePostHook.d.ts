import { PostHook } from './PostHook';
import { BackkEntity } from '../../types/entities/BackkEntity';
import { SubEntity } from '../../types/entities/SubEntity';
export default function tryExecutePostHook<T extends BackkEntity | SubEntity>(postHook: PostHook<T>, entity: T | null | undefined): Promise<void>;
