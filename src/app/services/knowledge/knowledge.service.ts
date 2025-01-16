import {
  Injectable,
  Signal,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';

import { Observable, filter, interval, startWith, switchMap } from 'rxjs';

import { addHours, addMinutes, isBefore, lightFormat, parse } from 'date-fns';

import {
  ARCHIVE_ENTRY_FILENAME_DATE_FORMAT,
  ArchiveService,
} from '@rusbe/services/archive/archive.service';
import { GeneralGoodsBalanceType } from '@rusbe/services/general-goods/general-goods.service';
import { ArchiveEntry, MealType } from '@rusbe/types/archive';
import { BrlCurrency } from '@rusbe/types/brl-currency';

import {
  DEFAULT_USER_PREFERENCES,
  PreferencesService,
  UserPreferences,
} from '../preferences/preferences.service';

@Injectable({
  providedIn: 'root',
})
export class KnowledgeService {
  private readonly KNOWLEDGE_UPDATE_INTERVAL_IN_MILLIS = 60 * 1000;
  private readonly DAYS_TO_CHECK_WHEN_TRAVERSING_ARCHIVE_ENTRIES = 7;

  private archiveService = inject(ArchiveService);
  private preferencesService = inject(PreferencesService);
  private knowledgeUpdateObservable: Observable<number>;
  private writableCurrentOperationStatus: WritableSignal<
    OperationStatus | undefined
  > = signal(undefined);
  private writableMostRelevantArchiveEntryInfo: WritableSignal<
    MostRelevantArchiveEntryInfo | undefined
  > = signal(undefined);

  public readonly currentOperationStatus: Signal<OperationStatus | undefined> =
    this.writableCurrentOperationStatus.asReadonly();
  public readonly mostRelevantArchiveEntryInfo: Signal<
    MostRelevantArchiveEntryInfo | undefined
  > = this.writableMostRelevantArchiveEntryInfo.asReadonly();

  constructor() {
    // Wait for preferences to be defined, then start interval
    this.knowledgeUpdateObservable =
      this.preferencesService.userPreferencesObservable.pipe(
        // Filter out when preferences are undefined
        filter(
          (preferences): preferences is UserPreferences =>
            preferences !== undefined,
        ),
        // Start the interval stream only after preferences are set
        switchMap(() => {
          return interval(this.KNOWLEDGE_UPDATE_INTERVAL_IN_MILLIS).pipe(
            startWith(0),
          );
        }),
      );

    this.setupKnowledgeAutoRefresh();
  }

  private async setupKnowledgeAutoRefresh() {
    this.knowledgeUpdateObservable.subscribe(async () => {
      await this.updateCurrentOperationStatusSignal();
      await this.updateMostRelevantArchiveEntryInfoSignal();
    });
  }

  private async updateCurrentOperationStatusSignal() {
    const currentOperationStatus = await this.getCurrentOperationStatus();
    this.writableCurrentOperationStatus.set(currentOperationStatus);
  }

  private async updateMostRelevantArchiveEntryInfoSignal() {
    const mostRelevantArchiveEntryInfo =
      await this.getMostRelevantArchiveEntryInfo();
    this.writableMostRelevantArchiveEntryInfo.set(mostRelevantArchiveEntryInfo);
  }

  private getRelevantMeals(): MealType[] {
    const preferences = this.preferencesService.userPreferences()!;

    if (!preferences.relevantMeals || preferences.relevantMeals.length === 0) {
      return DEFAULT_USER_PREFERENCES.relevantMeals;
    }

    return preferences.relevantMeals;
  }

  private async getMostRelevantArchiveEntryInfo(): Promise<MostRelevantArchiveEntryInfo> {
    const relevantMeals = this.getRelevantMeals();
    const currentOperationStatus = this.currentOperationStatus();

    if (!currentOperationStatus) {
      // This should never happen since we set operation status before this
      throw new Error('CurrentOperationStatusUnavailable');
    }

    if (
      currentOperationStatus.currentStatus === OperationStatusType.Open &&
      relevantMeals.includes(currentOperationStatus.servingMeal as MealType)
    ) {
      return {
        title: currentOperationStatus.sourceArchiveEntryDateString,
        mealType: currentOperationStatus.servingMeal as MealType,
        isMenuRelevant: false,
      };
    }

    if (
      currentOperationStatus.currentStatus === OperationStatusType.Closed &&
      relevantMeals.includes(
        currentOperationStatus.nextMilestone?.meal as MealType,
      )
    ) {
      return {
        title: currentOperationStatus.sourceArchiveEntryDateString!,
        mealType: currentOperationStatus.nextMilestone?.meal as MealType,
        isMenuRelevant: false,
      };
    }

    const relevantStartingPoint =
      currentOperationStatus.sourceArchiveEntryDateString;

    if (relevantStartingPoint) {
      return this.traverseArchiveEntriesToFindMostRelevantInfo(
        relevantStartingPoint,
        relevantMeals,
        false,
        currentOperationStatus.nextMilestone?.meal,
      );
    }

    const availableEntriesList = await this.archiveService
      .getAvailableEntriesList()
      .asDateString();

    const latestEntry = availableEntriesList[availableEntriesList.length - 1];

    return this.traverseArchiveEntriesToFindMostRelevantInfo(
      latestEntry,
      relevantMeals,
      true,
    );
  }

  private async traverseArchiveEntriesToFindMostRelevantInfo(
    startingPointDateString: string,
    relevantMeals: MealType[],
    backwards: boolean,
    startFromMeal?: MealType | string,
  ): Promise<MostRelevantArchiveEntryInfo> {
    for (
      let currentlyCheckingDay = 0;
      currentlyCheckingDay < this.DAYS_TO_CHECK_WHEN_TRAVERSING_ARCHIVE_ENTRIES;
      currentlyCheckingDay++
    ) {
      const checkingDate = addHours(
        parse(
          startingPointDateString,
          ARCHIVE_ENTRY_FILENAME_DATE_FORMAT,
          new Date(),
        ),
        24 * currentlyCheckingDay * (backwards ? -1 : 1),
      );
      const checkingDateString = lightFormat(
        checkingDate,
        ARCHIVE_ENTRY_FILENAME_DATE_FORMAT,
      );

      const archiveEntry =
        await this.archiveService.getArchiveEntryFromDateString(
          checkingDateString,
        );

      if (!archiveEntry) {
        continue;
      }

      const meal = this.tryFindRelevantMealInArchiveEntry(
        archiveEntry,
        relevantMeals,
        backwards,
        currentlyCheckingDay === 0 ? startFromMeal : undefined,
      );

      if (meal) {
        return {
          title: checkingDateString,
          mealType: meal.type as MealType,
          isMenuRelevant: backwards,
        };
      }
    }

    // This should never happen unless archive is empty or something went wrong
    throw new Error('CannotFindMostRelevantArchiveEntryInfo');
  }

  private tryFindRelevantMealInArchiveEntry(
    archiveEntry: ArchiveEntry,
    relevantMeals: MealType[],
    backwards = false,
    startWith: MealType | string | undefined = undefined,
  ) {
    const mealsInOrder = archiveEntry.operationDay.meals
      .slice()
      .sort((a, b) => {
        return a.startTime.getTime() - b.endTime.getTime();
      });

    if (backwards) {
      mealsInOrder.reverse();
    }

    let startIndex = 0;

    if (startWith) {
      startIndex = mealsInOrder.findIndex((meal) => meal.type === startWith);
    }

    for (const meal of mealsInOrder.slice(startIndex)) {
      if (relevantMeals.includes(meal.type as MealType)) {
        return meal;
      }
    }

    return undefined;
  }

  public getDateInRestaurantTimezone(date: Date = new Date()): Date {
    if (!this.isDeviceInRestaurantTimezone()) {
      const timezoneOffset =
        this.getDeviceTimezoneOffset() - this.getRestaurantTimezoneOffset();
      const restaurantDate = addMinutes(date, timezoneOffset);

      return restaurantDate;
    }

    return date;
  }

  private async getCurrentOperationStatus(): Promise<OperationStatus> {
    const today = this.getDateInRestaurantTimezone();

    for (
      let currentlyCheckingDay = 0;
      currentlyCheckingDay < this.DAYS_TO_CHECK_WHEN_TRAVERSING_ARCHIVE_ENTRIES;
      currentlyCheckingDay++
    ) {
      const checkingDate = addHours(today, 24 * currentlyCheckingDay);
      const checkingDateString = lightFormat(
        checkingDate,
        ARCHIVE_ENTRY_FILENAME_DATE_FORMAT,
      );

      const archiveEntry =
        await this.archiveService.getArchiveEntryFromDateString(
          checkingDateString,
        );

      if (!archiveEntry) {
        continue;
      }

      const operationStatus = this.tryInferOperationStatusFromArchiveEntry(
        archiveEntry,
        checkingDateString,
      );

      if (operationStatus) {
        return operationStatus;
      }
    }

    return {
      currentStatus: OperationStatusType.Closed,
    };
  }

  private tryInferOperationStatusFromArchiveEntry(
    archiveEntry: ArchiveEntry,
    archiveEntryDateString: string,
  ): OperationStatus | undefined {
    const now = new Date();
    const mealsInOrder = archiveEntry.operationDay.meals
      .slice()
      .sort((a, b) => {
        return a.startTime.getTime() - b.endTime.getTime();
      });

    for (const meal of mealsInOrder) {
      if (isBefore(now, meal.startTime)) {
        return {
          currentStatus: OperationStatusType.Closed,
          nextMilestone: {
            status: OperationStatusType.Open,
            time: meal.startTime,
            meal: meal.type,
          },
          sourceArchiveEntryDateString: archiveEntryDateString,
        };
      }

      if (isBefore(now, meal.endTime)) {
        return {
          currentStatus: OperationStatusType.Open,
          servingMeal: meal.type,
          nextMilestone: {
            status: OperationStatusType.Closed,
            time: meal.endTime,
          },
          sourceArchiveEntryDateString: archiveEntryDateString,
        };
      }
    }

    return undefined;
  }

  private getDeviceTimezoneOffset(): number {
    return new Date().getTimezoneOffset();
  }

  public getRestaurantTimezoneOffset(): number {
    const now = new Date();
    now.setSeconds(0, 0);

    const timezoneDateString = now.toLocaleString('en-US', {
      timeZone: RESTAURANT_TIMEZONE,
      hourCycle: 'h23',
    });

    const match = /(\d+)\/(\d+)\/(\d+), (\d+):(\d+)/.exec(timezoneDateString);
    const [month, day, year, hour, min] = match!.map(Number).slice(1);

    const timezoneDate = Date.UTC(year, month - 1, day, hour, min);

    return -Math.floor((timezoneDate - now.getTime()) / (1000 * 60));
  }

  public isDeviceInRestaurantTimezone(): boolean {
    return (
      this.getDeviceTimezoneOffset() === this.getRestaurantTimezoneOffset()
    );
  }
}

export type OperationStatus = OperationOpenStatus | OperationClosedStatus;

export interface OperationOpenStatus {
  currentStatus: OperationStatusType.Open;
  servingMeal: MealType | string;
  nextMilestone: OperationMilestone;
  sourceArchiveEntryDateString: string;
}

export interface OperationClosedStatus {
  currentStatus: OperationStatusType.Closed;
  nextMilestone?: OperationMilestone;
  sourceArchiveEntryDateString?: string;
}

export interface OperationMilestone {
  status: OperationStatusType;
  time: Date;
  meal?: MealType | string;
}

export interface MealPrice {
  price: BrlCurrency;
  meal: MealType;
  payDirectlyToVendor: boolean;
}

export interface MealPricingProfile {
  title: string;
  description: string;
  balanceType: GeneralGoodsBalanceType;
  pricing: MealPrice[];
}

export enum OperationStatusType {
  Open = 'Open',
  Closed = 'Closed',
}

export interface MostRelevantArchiveEntryInfo {
  title: string;
  mealType: MealType;
  isMenuRelevant: boolean;
}

export interface RestaurantWorkingHoursPeriod {
  meal: MealType;
  startTime: string;
  endTime: string;
}

export const RESTAURANT_TIMEZONE = 'America/Recife';
export const MAIN_COURSE_NAME = 'Prato principal';
export const RESTAURANT_REGULARLY_OPEN_DAYS = [
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
];
export const RESTAURANT_WORKING_HOURS: RestaurantWorkingHoursPeriod[] = [
  { meal: MealType.Breakfast, startTime: '7h', endTime: '8h' },
  { meal: MealType.Lunch, startTime: '10h30', endTime: '14h30' },
  { meal: MealType.Dinner, startTime: '17h00', endTime: '19h00' },
];
export const MEAL_PRICING_PROFILES: MealPricingProfile[] = [
  {
    title: 'Sem subsídio',
    description: `Servidores da UFPE e visitantes.`,
    balanceType: GeneralGoodsBalanceType.NoGrant,
    pricing: [
      {
        meal: MealType.Breakfast,
        price: BrlCurrency.fromNumber(10.31),
        payDirectlyToVendor: true,
      },
      {
        meal: MealType.Lunch,
        price: BrlCurrency.fromNumber(11.95),
        payDirectlyToVendor: true,
      },
      {
        meal: MealType.Dinner,
        price: BrlCurrency.fromNumber(12.2),
        payDirectlyToVendor: true,
      },
    ],
  },
  {
    title: 'Subsídio parcial',
    description: `Estudantes de graduação regularmente matriculados nos cursos presenciais da UFPE, pós-graduação stricto sensu acadêmico e profissional, regularmente matriculados nos cursos presenciais da UFPE.`,
    balanceType: GeneralGoodsBalanceType.PartialGrant,
    pricing: [
      {
        meal: MealType.Breakfast,
        price: BrlCurrency.fromNumber(10.31),
        payDirectlyToVendor: true,
      },
      {
        meal: MealType.Lunch,
        price: BrlCurrency.fromNumber(4.78),
        payDirectlyToVendor: false,
      },
      {
        meal: MealType.Dinner,
        price: BrlCurrency.fromNumber(4.88),
        payDirectlyToVendor: false,
      },
    ],
  },
  {
    title: 'Subsídio integral',
    description: `Estudantes regularmente matriculados nos cursos presenciais da UFPE, aprovados no edital de assistência estudantil.`,
    balanceType: GeneralGoodsBalanceType.FullGrant,
    pricing: [
      {
        meal: MealType.Breakfast,
        price: BrlCurrency.fromNumber(10.31),
        payDirectlyToVendor: true,
      },
      {
        meal: MealType.Lunch,
        price: BrlCurrency.fromNumber(0),
        payDirectlyToVendor: false,
      },
      {
        meal: MealType.Dinner,
        price: BrlCurrency.fromNumber(0),
        payDirectlyToVendor: false,
      },
    ],
  },
  {
    title: 'Subsídio integral (moradia estudantil)',
    description: `Estudantes regularmente matriculados nos cursos presenciais da UFPE, participantes do programa de moradia estudantil.`,
    balanceType: GeneralGoodsBalanceType.FullGrantStudentHousing,
    pricing: [
      {
        meal: MealType.Breakfast,
        price: BrlCurrency.fromNumber(0),
        payDirectlyToVendor: false,
      },
      {
        meal: MealType.Lunch,
        price: BrlCurrency.fromNumber(0),
        payDirectlyToVendor: false,
      },
      {
        meal: MealType.Dinner,
        price: BrlCurrency.fromNumber(0),
        payDirectlyToVendor: false,
      },
    ],
  },
];
