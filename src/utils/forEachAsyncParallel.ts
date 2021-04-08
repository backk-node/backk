export default async function forEachAsyncParallel<T>(
  array: T[],
  callback: (value: T, index: number, Array: T[]) => unknown
): Promise<void> {
  await Promise.all(array.map(callback));
}
