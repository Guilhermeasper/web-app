import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardAccountVerificationComponent } from './account-verification.component';

describe('WizardAccountVerificationComponent', () => {
  let component: WizardAccountVerificationComponent;
  let fixture: ComponentFixture<WizardAccountVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardAccountVerificationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardAccountVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
