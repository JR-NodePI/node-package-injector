/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_TITLE: string;
  readonly PACKAGE_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Array<T> {
  toSorted(compareFn?: (a: T, b: T) => number): T[];
}

interface Array<T> {
  toSpliced(start: number, deleteCount: number, ...items: T[]): T[];
}
