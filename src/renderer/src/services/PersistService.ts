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

  public static async setItem<T>(key: string, value: T): Promise<void> {
    const data = await PersistService.load();
    data[key] = value;
    PersistService.save(data);
  }

  public static async getItem<T>(key: string): Promise<T> {
    const data = await PersistService.load();
    return data[key];
  }
}
