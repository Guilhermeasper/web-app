import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { lastValueFrom } from 'rxjs';

import { differenceInMilliseconds, parse } from 'date-fns';

import superjson, { SuperJSONResult } from 'superjson';

import { environment } from '../../../environments/environment';
import {
  ArchiveEntry,
  ArchiveFileEntry,
  ArchiveIndex,
} from '../../types/archive';

@Injectable({
  providedIn: 'root',
})
export class ArchiveService {
  private ARCHIVE_SERVICE_CACHE_TTL_IN_MILLIS = 10 * 60 * 1000;

  private http: HttpClient = inject(HttpClient);

  private indexCachedAt: Date | null = null;
  private archiveIndex: ArchiveIndex | null = null;
  private archiveEntries = new Map<string, ArchiveEntry>();

  public async getArchiveEntryFromDateString(
    dateString: string,
  ): Promise<ArchiveEntry | null> {
    return this.getArchiveEntryFromPredicate(
      (entry) => entry.title === dateString,
    );
  }

  public async getArchiveEntryFromPredicate(
    predicate: (entry: ArchiveFileEntry, index: number) => boolean,
  ): Promise<ArchiveEntry | null> {
    const index = await this.getArchiveIndex();
    const entry = index.find(predicate);

    if (!entry) {
      return null;
    }

    const cachedEntry = this.archiveEntries.get(entry.title);
    if (cachedEntry) {
      return cachedEntry;
    }

    const archiveEntry = await this.getSuperJsonFromUrl<ArchiveEntry>(
      entry.url,
    );
    this.archiveEntries.set(entry.title, archiveEntry);

    return archiveEntry;
  }

  public getAvailableEntriesList(): AvailableEntriesTransformer {
    const index = this.getArchiveIndex();
    return {
      asDateString: async () => {
        return (await index).map((day) => day.title);
      },
      asDateObject: async () => {
        return (await index).map((day) =>
          parse(day.title, ARCHIVE_ENTRY_FILENAME_DATE_FORMAT, new Date()),
        );
      },
    };
  }

  private async getArchiveIndex(): Promise<ArchiveIndex> {
    if (!this.isIndexStale() && this.archiveIndex) {
      return this.archiveIndex;
    }

    const archiveIndexUrl = new URL('index.json', environment.archiveUrl);
    const archiveIndex =
      await this.getSuperJsonFromUrl<ArchiveIndex>(archiveIndexUrl);
    this.archiveIndex = archiveIndex;
    this.indexCachedAt = new Date();
    this.archiveEntries.clear();

    return archiveIndex;
  }

  private async getSuperJsonFromUrl<T extends object>(
    url: string | URL,
  ): Promise<T> {
    try {
      const response = await lastValueFrom(
        this.http.get<SuperJSONResult>(url.toString()),
      );
      const deserializedResponse = superjson.deserialize<T>(response);
      return deserializedResponse;
    } catch {
      throw new Error('RequestFailedError');
    }
  }

  private isIndexStale(): boolean {
    if (!this.indexCachedAt) {
      return true;
    }

    const now = new Date();
    const isOlderThanTenMinutes =
      differenceInMilliseconds(now, this.indexCachedAt) >
      this.ARCHIVE_SERVICE_CACHE_TTL_IN_MILLIS;

    return isOlderThanTenMinutes;
  }
}

export interface AvailableEntriesTransformer {
  asDateString: () => Promise<string[]>;
  asDateObject: () => Promise<Date[]>;
}

export const ARCHIVE_ENTRY_FILENAME_DATE_FORMAT = 'yyyy-MM-dd';
