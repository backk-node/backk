import { PromiseErrorOr } from '../types/PromiseErrorOr';
export default function executeForAll<T, U>(values: T[], func: (value: T) => PromiseErrorOr<U | null>): PromiseErrorOr<null>;
