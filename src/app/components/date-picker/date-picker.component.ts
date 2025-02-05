import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  model,
} from '@angular/core';

import {
  Day,
  addDays,
  getDay,
  isSameDay,
  lightFormat,
  parse,
  subDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

import { AngularDelegate } from '@ionic/angular/common';
import {
  DatetimeChangeEventDetail,
  IonDatetime,
  IonPopover,
  PopoverController,
} from '@ionic/angular/standalone';
import { initialize as initializeIonicCore } from '@ionic/core/components';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideArrowRight,
  lucideCalendarDays,
} from '@ng-icons/lucide';

import {
  ARCHIVE_ENTRY_FILENAME_DATE_FORMAT,
  ArchiveService,
} from '@rusbe/services/archive/archive.service';
import { KnowledgeService } from '@rusbe/services/knowledge/knowledge.service';
import {
  capitalizeFirstCharacter,
  stripTimeFromIsoDateTimeString,
} from '@rusbe/utils/strings';

initializeIonicCore();

@Component({
  selector: 'rusbe-date-picker',
  imports: [NgIcon, IonDatetime, IonPopover],
  providers: [AngularDelegate, PopoverController],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css',
  viewProviders: [
    provideIcons({
      lucideCalendarDays,
      lucideArrowLeft,
      lucideArrowRight,
    }),
  ],
})
export class DatePickerComponent implements OnInit, OnDestroy {
  @ViewChild(IonPopover) popover!: IonPopover;

  knowledgeService = inject(KnowledgeService);
  archiveService = inject(ArchiveService);

  selectedDate = model.required<string | undefined>();
  availableDaysString: string[] = [];

  selectedDateObject = computed(() => {
    const date = this.selectedDate();

    if (date === undefined) {
      return undefined;
    }

    return parse(date, ARCHIVE_ENTRY_FILENAME_DATE_FORMAT, new Date());
  });

  selectedWeekday = computed(() => {
    const dateObject = this.selectedDateObject();

    if (dateObject === undefined) {
      return undefined;
    }

    const day = getDay(dateObject);
    return capitalizeFirstCharacter(ptBR.localize.day(day as Day));
  });

  selectedDayAndMonth = computed(() => {
    return this.selectedDateObject()?.toLocaleDateString('pt-BR', {
      month: 'long',
      day: 'numeric',
    });
  });

  isToday = computed(() => {
    const dateObject = this.selectedDateObject();

    if (dateObject === undefined) {
      return undefined;
    }

    return isSameDay(
      this.knowledgeService.getDateInRestaurantTimezone(),
      dateObject,
    );
  });

  getTodayStringInRestaurantTimezone() {
    return lightFormat(
      this.knowledgeService.getDateInRestaurantTimezone(),
      ARCHIVE_ENTRY_FILENAME_DATE_FORMAT,
    );
  }

  commitDateSelection(event: CustomEvent<DatetimeChangeEventDetail>) {
    if (event.detail.value && typeof event.detail.value === 'string') {
      const selectedDate = stripTimeFromIsoDateTimeString(event.detail.value);
      this.selectedDate.set(selectedDate);
    }

    this.dismissPickerPopover();
  }

  goToPreviousDate() {
    const dateObject = this.selectedDateObject();

    if (dateObject === undefined) {
      return;
    }

    const previousDay = subDays(dateObject, 1);
    this.selectedDate.set(
      lightFormat(previousDay, ARCHIVE_ENTRY_FILENAME_DATE_FORMAT),
    );
  }

  goToNextDate() {
    const dateObject = this.selectedDateObject();

    if (dateObject === undefined) {
      return;
    }

    const nextDay = addDays(dateObject, 1);
    this.selectedDate.set(
      lightFormat(nextDay, ARCHIVE_ENTRY_FILENAME_DATE_FORMAT),
    );
  }

  isDateMenuAvailable = (date: string) => {
    return this.availableDaysString.includes(date);
  };

  async dismissPickerPopover() {
    await this.popover.dismiss();
  }

  async ngOnDestroy() {
    this.popover.animated = false;
    await this.dismissPickerPopover();
  }

  async ngOnInit() {
    this.availableDaysString = await this.archiveService
      .getAvailableEntriesList()
      .asDateString();
  }
}
