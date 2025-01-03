import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  model,
} from '@angular/core';

import { Day, getDay, isSameDay, lightFormat, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

import {
  DatetimeChangeEventDetail,
  IonDatetime,
  IonPopover,
} from '@ionic/angular/standalone';
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
import { capitalizeFirstCharacter } from '@rusbe/utils/strings';

@Component({
  selector: 'rusbe-date-picker',
  imports: [NgIcon, IonDatetime, IonPopover],
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
      // Remove the time part from the selected date string.
      const selectedDate = event.detail.value.slice(0, 10);

      this.selectedDate.set(selectedDate);
    }
    this.dismissPickerPopover();
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
