import { Component, output } from '@angular/core';

@Component({
  selector: 'rusbe-wizard-setup-complete',
  imports: [],
  templateUrl: './setup-complete.component.html',
})
export class WizardSetupCompleteComponent {
  exitWizard = output<void>();
}
