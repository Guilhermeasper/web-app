import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardAccountConfigurationErrorComponent } from './account-configuration-error.component';

describe('WizardAccountConfigurationErrorComponent', () => {
  let component: WizardAccountConfigurationErrorComponent;
  let fixture: ComponentFixture<WizardAccountConfigurationErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardAccountConfigurationErrorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardAccountConfigurationErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
