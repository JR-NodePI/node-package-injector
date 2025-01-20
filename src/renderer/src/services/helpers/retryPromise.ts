import delay from './delay';

export default async function retryPromise<T>(
  getPromise: () => Promise<T>,
  retries = 5,
  delayMs = 100
): Promise<T | null> {
  if (retries == 0) {
    return Promise.resolve(null);
  }

  try {
    return await getPromise();
  } catch (e) {
    if (retries > 0) {
      await delay(delayMs);
      return retryPromise(getPromise, retries - 1);
    } else {
      Promise.resolve();
    }
    throw e;
  }
}
