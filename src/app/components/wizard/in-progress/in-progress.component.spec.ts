import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardInProgressComponent } from './in-progress.component';

describe('WizardInProgressComponent', () => {
  let component: WizardInProgressComponent;
  let fixture: ComponentFixture<WizardInProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardInProgressComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardInProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
