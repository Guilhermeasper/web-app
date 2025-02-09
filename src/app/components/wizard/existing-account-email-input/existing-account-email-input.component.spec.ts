import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardExistingAccountEmailInputComponent } from './existing-account-email-input.component';

describe('WizardExistingAccountEmailInputComponent', () => {
  let component: WizardExistingAccountEmailInputComponent;
  let fixture: ComponentFixture<WizardExistingAccountEmailInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardExistingAccountEmailInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardExistingAccountEmailInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
