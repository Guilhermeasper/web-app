import { Dialog, DialogModule } from '@angular/cdk/dialog';
import {
  Component,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  computed,
  inject,
  model,
} from '@angular/core';

import { Day, getDay, isSameDay, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendarDays } from '@ng-icons/lucide';
import { Calendar } from 'vanilla-calendar-pro';

import {
  ARCHIVE_ENTRY_FILENAME_DATE_FORMAT,
  ArchiveService,
} from '../../services/archive/archive.service';
import { KnowledgeService } from '../../services/knowledge/knowledge.service';

@Component({
  selector: 'rusbe-date-picker',
  imports: [NgIcon, DialogModule],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css',
  encapsulation: ViewEncapsulation.None,
  viewProviders: [provideIcons({ lucideCalendarDays })],
})
export class DatePickerComponent {
  // TODO: Highlight today's date and add a button to go back to today.

  @ViewChild('pickerDialog') pickerDialogTemplate!: TemplateRef<Element>;

  knowledgeService = inject(KnowledgeService);
  archiveService = inject(ArchiveService);
  dialog = inject(Dialog);

  calendar?: Calendar;
  selectedDate = model.required<string | undefined>();

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
    return this.capitalizeFirstLetter(ptBR.localize.day(day as Day));
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

  async openPickerDialog() {
    const dialogRef = this.dialog.open(this.pickerDialogTemplate, {
      height: '400px',
      width: '400px',
      panelClass: 'date-picker-dialog',
    });

    dialogRef.closed.subscribe(() => {
      this.destroyCalendarInstance();
    });

    await this.createCalendarInstance();
  }

  async createCalendarInstance() {
    const calendarContainer = document.querySelector(
      '#calendar-container',
    ) as HTMLElement;

    this.calendar = new Calendar(calendarContainer, {
      disableAllDates: true,
      locale: 'pt-BR',
      firstWeekday: 0,
      enableDates: await this.archiveService
        .getAvailableEntriesList()
        .asDateString(),
    });
    this.calendar.init();
    Array.from(document.getElementsByClassName('vc-week__day')).forEach(
      (element) => {
        element.setAttribute('tabindex', '-1');
      },
    );
  }

  async destroyCalendarInstance() {
    this.calendar?.destroy();
    this.calendar = undefined;
  }

  async closePickerDialog() {
    // TODO: Run animation before opening and closing the dialog.
  }

  capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
