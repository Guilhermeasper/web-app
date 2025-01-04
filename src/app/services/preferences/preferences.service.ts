import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import {
  LocalStorageService,
  StorageKey,
} from '@rusbe/services/local-storage/local-storage.service';
import { MealType } from '@rusbe/types/archive';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private readonly PREFERENCES_STORAGE_KEY = StorageKey.UserPreferences;
  private localStorageService = inject(LocalStorageService);
  private writableUserPreferences: WritableSignal<UserPreferences | undefined> =
    signal(undefined);

  public userPreferences = this.writableUserPreferences.asReadonly();
  public userPreferencesObservable = toObservable(this.userPreferences);

  private systemDarkThemeMediaQuery = window.matchMedia(
    '(prefers-color-scheme: dark)',
  );
  private systemThemeChangeEventListener?: (
    mediaQuery: MediaQueryListEvent,
  ) => void;

  constructor() {
    this.setupUserPreferences();
  }

  private async setupUserPreferences() {
    await this.refreshUserPreferencesFromStorage();
    this.applyInterfaceTheme();
  }

  private async setPreference(
    preferenceKey: keyof UserPreferences,
    preferenceValue: UserPreferences[keyof UserPreferences],
  ) {
    this.writableUserPreferences.update(
      (currentPreferences: UserPreferences | undefined) => {
        if (currentPreferences === undefined) {
          throw new Error('UserPreferencesNotInitialized');
        }

        return {
          ...currentPreferences,
          [preferenceKey]: preferenceValue,
        };
      },
    );

    await this.updateUserPreferencesOnStorage();
  }

  async setInterfaceThemePreference(interfaceThemePreference: InterfaceTheme) {
    await this.setPreference('interfaceTheme', interfaceThemePreference);
    this.applyInterfaceTheme();
  }

  async setShowMainCourseOnTopPreference(value: boolean) {
    await this.setPreference('showMainCourseOnTop', value);
  }

  async setShowMainCourseWithLargerFontPreference(value: boolean) {
    await this.setPreference('showMainCourseWithLargerFont', value);
  }

  async setRelevantMealsPreference(relevantMeals: MealType[]) {
    if (relevantMeals.length === 0) {
      throw new Error('InvalidPreferencesSelection');
    }

    await this.setPreference('relevantMeals', relevantMeals);
  }

  async setHideCreditsPreference(value: boolean) {
    await this.setPreference('hideCredits', value);
  }

  async setUserPreferencesToDefault() {
    this.writableUserPreferences.set(DEFAULT_USER_PREFERENCES);
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

    const userPreferences = this.userPreferences();

    if (userPreferences === undefined) {
      throw new Error('UserPreferencesNotInitialized');
    }

    const literalInterfaceTheme: InterfaceTheme.Light | InterfaceTheme.Dark =
      (() => {
        if (userPreferences.interfaceTheme === InterfaceTheme.System) {
          return this.systemDarkThemeMediaQuery.matches
            ? InterfaceTheme.Dark
            : InterfaceTheme.Light;
        }

        return userPreferences.interfaceTheme;
      })();

    try {
      if (userPreferences.interfaceTheme === InterfaceTheme.System) {
        this.systemThemeChangeEventListener = (mediaQuery) =>
          this.applyLiteralInterfaceTheme(
            mediaQuery.matches ? InterfaceTheme.Dark : InterfaceTheme.Light,
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
    literalInterfaceTheme: InterfaceTheme.Light | InterfaceTheme.Dark,
  ) {
    document.body.classList.toggle(
      'dark',
      literalInterfaceTheme === InterfaceTheme.Dark,
    );

    const literalInterfaceThemeToMetaColor = {
      [InterfaceTheme.Light]: '#fee7e5',
      [InterfaceTheme.Dark]: '#131313',
    };
    const metaThemeColorTag = document.querySelector(
      'meta[name="theme-color"]',
    );

    if (metaThemeColorTag) {
      metaThemeColorTag.setAttribute(
        'content',
        literalInterfaceThemeToMetaColor[literalInterfaceTheme],
      );
    }
  }

  private async refreshUserPreferencesFromStorage() {
    const storagePreferences =
      (await this.localStorageService.get(this.PREFERENCES_STORAGE_KEY)) ?? {};
    this.writableUserPreferences.set({
      ...DEFAULT_USER_PREFERENCES,
      ...storagePreferences,
    });
  }

  private async updateUserPreferencesOnStorage() {
    await this.localStorageService.set(
      this.PREFERENCES_STORAGE_KEY,
      this.userPreferences(),
    );
  }
}

export interface UserPreferences {
  interfaceTheme: InterfaceTheme;
  showMainCourseOnTop: boolean;
  showMainCourseWithLargerFont: boolean;
  relevantMeals: MealType[];
  hideCredits: boolean;
}

export enum InterfaceTheme {
  System = 'system',
  Light = 'light',
  Dark = 'dark',
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  interfaceTheme: InterfaceTheme.System,
  showMainCourseOnTop: true,
  showMainCourseWithLargerFont: true,
  relevantMeals: [MealType.Breakfast, MealType.Lunch, MealType.Dinner],
  hideCredits: false,
};
