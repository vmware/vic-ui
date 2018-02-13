import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {
  localStorage: Storage;

  constructor() {
    if (window.localStorage === undefined) {
      throw new Error('Cannot use localStorage!');
    }
    this.localStorage = window.localStorage;
  }

  get(key: string): any {
    return this.localStorage.getItem(key);
  }

  set(key: string, value: string): void {
    this.localStorage.setItem(key, value);
  }

  delete(key: string): void {
    this.localStorage.removeItem(key);
  }

  clear(): void {
    this.localStorage.clear();
  }

  getKey(idx: number): string {
    return this.localStorage.key(idx);
  }

  get length(): number {
    return this.localStorage.length;
  }
}
