import { BackkError } from './BackkError';
export declare type PromiseErrorOr<T> = Promise<[T | null | undefined, BackkError | null | undefined]>;
