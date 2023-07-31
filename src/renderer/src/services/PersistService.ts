import { debounce } from 'lodash';

export default class PersistService {
  private static key = 'persist_data';

  private static async save(data = {}): Promise<void> {
    globalThis.localStorage.setItem(PersistService.key, JSON.stringify(data));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static async load(): Promise<any> {
    const data = globalThis.localStorage.getItem(PersistService.key);
    return JSON.parse(data || '{}');
  }

  public static async clear(): Promise<void> {
    PersistService.save({});
  }

  private static itemsToSaveQueue: { [key: string]: unknown } = {};
  private static async saveQueue(): Promise<void> {
    const data = await PersistService.load();
    const newData = Object.entries(PersistService.itemsToSaveQueue).reduce(
      (newData, [key, value]) => {
        newData[key] = value;
        return newData;
      },
      data
    );
    PersistService.itemsToSaveQueue = {};
    PersistService.save(newData);
  }
  private static debouncedSaveQueue = debounce(PersistService.saveQueue, 100);

  public static async setItem<T>(key: string, value: T): Promise<void> {
    PersistService.itemsToSaveQueue[key] = value;
    await PersistService.debouncedSaveQueue();
  }

  public static async getItem<T>(key: string): Promise<T> {
    const data = await PersistService.load();
    return data[key];
  }
}
