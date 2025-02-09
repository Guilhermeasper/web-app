import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardNewAccountIdentifierInputComponent } from './new-account-identifier-input.component';

describe('WizardNewAccountIdentifierInputComponent', () => {
  let component: WizardNewAccountIdentifierInputComponent;
  let fixture: ComponentFixture<WizardNewAccountIdentifierInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardNewAccountIdentifierInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardNewAccountIdentifierInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
