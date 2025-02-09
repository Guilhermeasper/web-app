import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardExistingAccountEmailCheckComponent } from './existing-account-email-check.component';

describe('WizardExistingAccountEmailCheckComponent', () => {
  let component: WizardExistingAccountEmailCheckComponent;
  let fixture: ComponentFixture<WizardExistingAccountEmailCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardExistingAccountEmailCheckComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardExistingAccountEmailCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
