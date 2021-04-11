export default function forEachAsyncParallel<T>(array: T[], callback: (value: T, index: number, Array: T[]) => unknown): Promise<void>;
