import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardAccountSetupDisclaimerComponent } from './account-setup-disclaimer.component';

describe('WizardAccountSetupDisclaimerComponent', () => {
  let component: WizardAccountSetupDisclaimerComponent;
  let fixture: ComponentFixture<WizardAccountSetupDisclaimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardAccountSetupDisclaimerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardAccountSetupDisclaimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
