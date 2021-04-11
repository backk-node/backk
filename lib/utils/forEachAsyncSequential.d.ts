export default function forEachAsyncSequential<T>(array: T[], callback: (value: T, index: number, Array: T[]) => Promise<void>): Promise<void>;
