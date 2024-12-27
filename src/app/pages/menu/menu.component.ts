import { Component, inject, linkedSignal, resource } from '@angular/core';

import { DatePickerComponent } from '@rusbe/components/date-picker/date-picker.component';
import {
  HeaderComponent,
  HeaderType,
} from '@rusbe/components/header/header.component';
import { RestaurantMenuViewerComponent } from '@rusbe/components/restaurant-menu-viewer/restaurant-menu-viewer.component';
import { ArchiveService } from '@rusbe/services/archive/archive.service';
import {
  KnowledgeService,
  MostRelevantArchiveEntryInfo,
} from '@rusbe/services/knowledge/knowledge.service';

@Component({
  selector: 'rusbe-menu-page',
  imports: [
    HeaderComponent,
    RestaurantMenuViewerComponent,
    DatePickerComponent,
  ],
  templateUrl: './menu.component.html',
})
export class MenuPageComponent {
  readonly HEADER_TYPE = HeaderType.PageNameWithBackButton;
  knowledgeService = inject(KnowledgeService);
  archiveService = inject(ArchiveService);

  selectedDate = linkedSignal<
    MostRelevantArchiveEntryInfo | undefined,
    string | undefined
  >({
    source: this.knowledgeService.mostRelevantArchiveEntryInfo,
    computation: (newInfo, currentlySelectedDate) => {
      // Ensure the most relevant date is selected when the component is first loaded
      if (!currentlySelectedDate?.value) {
        return newInfo?.title;
      }

      return currentlySelectedDate.value;
    },
  });

  selectedArchiveEntry = resource({
    request: () => ({ selectedDate: this.selectedDate() }),
    loader: ({ request }) =>
      (async () => {
        if (request.selectedDate) {
          return await this.archiveService.getArchiveEntryFromDateString(
            request.selectedDate,
          );
        }

        return undefined;
      })(),
  });
}
