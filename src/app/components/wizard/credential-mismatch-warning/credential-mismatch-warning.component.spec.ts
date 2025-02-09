import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardCredentialMismatchWarningComponent } from './credential-mismatch-warning.component';

describe('WizardCredentialMismatchWarningComponent', () => {
  let component: WizardCredentialMismatchWarningComponent;
  let fixture: ComponentFixture<WizardCredentialMismatchWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardCredentialMismatchWarningComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardCredentialMismatchWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
