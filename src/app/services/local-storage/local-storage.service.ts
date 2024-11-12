import { Injectable } from '@angular/core';

import { clear, del, get, set, update } from 'idb-keyval';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  async get<T>(key: StorageKey): Promise<T | undefined> {
    return get<T>(key);
  }

  async set(key: StorageKey, value: unknown): Promise<void> {
    return set(key, value);
  }

  async update<T>(key: StorageKey, updater: (value?: T) => T): Promise<void> {
    return update(key, updater);
  }

  async remove(key: StorageKey): Promise<void> {
    return del(key);
  }

  async clear(): Promise<void> {
    return clear();
  }
}

export enum StorageKey {
  GeneralGoodsBearerToken = 'general-goods-bearer-token',
  UserPreferences = 'user-preferences',
}
