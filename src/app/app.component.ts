import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PreferencesService } from '@rusbe/services/preferences/preferences.service';

@Component({
  selector: 'rusbe-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'rusbe-web-app';
  preferencesService = inject(PreferencesService);
}
