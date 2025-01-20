import delay from './delay';

export default async function retryPromise<T>(
  getPromise: () => Promise<T>,
  retries = 5,
  delayMs = 100
): Promise<T> {
  try {
    return await getPromise();
  } catch (e) {
    if (retries > 0) {
      await delay(delayMs);
      return retryPromise(getPromise, retries - 1);
    }
    throw e;
  }
}
