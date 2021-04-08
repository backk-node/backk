export default async function forEachAsyncSequential<T>(array: T[], callback: (value: T, index: number, Array: T[]) => Promise<void>) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
