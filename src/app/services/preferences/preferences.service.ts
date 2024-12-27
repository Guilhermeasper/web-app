import { Injectable, inject } from '@angular/core';

import {
  LocalStorageService,
  StorageKey,
} from '@rusbe/services/local-storage/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private readonly PREFERENCES_STORAGE_KEY = StorageKey.UserPreferences;
  private localStorageService = inject(LocalStorageService);
  private userPreferences?: UserPreferences;
  // FIXME: Avoid using this promise and ! operator
  private initialization: Promise<void>;

  private systemDarkThemeMediaQuery = window.matchMedia(
    '(prefers-color-scheme: dark)',
  );
  private systemThemeChangeEventListener?: (
    mediaQuery: MediaQueryListEvent,
  ) => void;

  constructor() {
    this.initialization = this.initialize();
  }

  async initialize() {
    await this.refreshUserPreferencesFromStorage();
    this.applyInterfaceTheme();
  }

  async getUserPreferences(): Promise<UserPreferences> {
    await this.initialization;
    return {
      ...this.userPreferences!,
    };
  }

  async setInterfaceThemePreference(interfaceThemePreference: InterfaceTheme) {
    this.userPreferences!.interfaceTheme = interfaceThemePreference;
    await this.updateUserPreferencesOnStorage();
    this.applyInterfaceTheme();
  }

  async setHideMonetaryValuesPreference(hideMonetaryValuesPreference: boolean) {
    this.userPreferences!.hideMonetaryValues = hideMonetaryValuesPreference;
    await this.updateUserPreferencesOnStorage();
  }

  async setUserPreferencesToDefault() {
    await this.initialization;
    this.userPreferences = this.getDefaultPreferences();
    await this.updateUserPreferencesOnStorage();
  }

  private applyInterfaceTheme() {
    if (this.systemThemeChangeEventListener) {
      this.systemDarkThemeMediaQuery.removeEventListener(
        'change',
        this.systemThemeChangeEventListener,
      );
      this.systemThemeChangeEventListener = undefined;
    }

    const literalInterfaceTheme: InterfaceTheme.light | InterfaceTheme.dark =
      (() => {
        if (this.userPreferences!.interfaceTheme === InterfaceTheme.system) {
          return this.systemDarkThemeMediaQuery.matches
            ? InterfaceTheme.dark
            : InterfaceTheme.light;
        }

        return this.userPreferences!.interfaceTheme;
      })();

    try {
      if (this.userPreferences!.interfaceTheme === InterfaceTheme.system) {
        this.systemThemeChangeEventListener = (mediaQuery) =>
          this.applyLiteralInterfaceTheme(
            mediaQuery.matches ? InterfaceTheme.dark : InterfaceTheme.light,
          );
        this.systemDarkThemeMediaQuery.addEventListener(
          'change',
          this.systemThemeChangeEventListener,
        );
      }
    } catch {
      console.error('Failed to add system theme change event listener');
    }
    this.applyLiteralInterfaceTheme(literalInterfaceTheme);
  }

  private applyLiteralInterfaceTheme(
    literalInterfaceTheme: InterfaceTheme.light | InterfaceTheme.dark,
  ) {
    document.body.classList.toggle(
      'dark',
      literalInterfaceTheme === InterfaceTheme.dark,
    );
    document.body.classList.toggle(
      'scheme-dark',
      literalInterfaceTheme === InterfaceTheme.dark,
    );
    document.body.classList.toggle(
      'scheme-light',
      literalInterfaceTheme === InterfaceTheme.light,
    );
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      interfaceTheme: InterfaceTheme.system,
      hideMonetaryValues: false,
    };
  }

  private async refreshUserPreferencesFromStorage() {
    const storagePreferences =
      (await this.localStorageService.get(this.PREFERENCES_STORAGE_KEY)) ?? {};
    this.userPreferences = {
      ...this.getDefaultPreferences(),
      ...storagePreferences,
    };
  }

  private async updateUserPreferencesOnStorage() {
    await this.localStorageService.set(
      this.PREFERENCES_STORAGE_KEY,
      this.userPreferences,
    );
  }
}

export interface UserPreferences {
  interfaceTheme: InterfaceTheme;
  hideMonetaryValues: boolean;
}

export enum InterfaceTheme {
  system = 'system',
  light = 'light',
  dark = 'dark',
}
