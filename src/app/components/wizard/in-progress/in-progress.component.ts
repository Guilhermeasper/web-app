import { Component } from '@angular/core';

import { SpinnerComponent } from '../../spinner/spinner.component';

@Component({
  selector: 'rusbe-wizard-in-progress',
  imports: [SpinnerComponent],
  templateUrl: './in-progress.component.html',
})
export class WizardInProgressComponent {}
