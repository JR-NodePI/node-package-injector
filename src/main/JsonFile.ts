import fs from 'fs';
import path from 'path';

export default class JsonFile {
  static read(filePath: string): Record<string, unknown> {
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, {
        encoding: 'utf8',
        flag: 'a+',
      });

      try {
        const data = JSON.parse(rawData);
        return data;
      } catch {
        return {};
      }
    }

    return {};
  }

  static write(filePath: string, data: Record<string, unknown>): void {
    const dir = path.resolve(path.dirname(filePath));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}
