export default async function findAsyncSequential<T>(
  values: T[],
  predicate: (value: T) => Promise<boolean>,
): Promise<T | undefined> {
  for (const value of values) {
    if (await predicate(value)) {
      return value;
    }
  }
  return undefined;
}
