export async function promiseAllSequentially<T>(
  promises: Promise<T>[]
): Promise<T[]> {
  const results: T[] = [];

  for (const promise of promises) {
    results.push(await promise);
  }

  return results;
}
