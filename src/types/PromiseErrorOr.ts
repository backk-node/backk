import { BackkError } from './BackkError';

export type PromiseErrorOr<T> = Promise<[T | null | undefined, BackkError | null | undefined]>;

