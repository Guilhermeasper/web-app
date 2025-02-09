import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardSetupCompleteComponent } from './setup-complete.component';

describe('WizardSetupCompleteComponent', () => {
  let component: WizardSetupCompleteComponent;
  let fixture: ComponentFixture<WizardSetupCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardSetupCompleteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardSetupCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
