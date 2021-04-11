export default function findAsyncSequential<T>(values: T[], predicate: (value: T) => Promise<boolean>): Promise<T | undefined>;
