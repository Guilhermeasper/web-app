import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardAccountConfigurationInProgressComponent } from './account-configuration-in-progress.component';

describe('WizardAccountConfigurationInProgressComponent', () => {
  let component: WizardAccountConfigurationInProgressComponent;
  let fixture: ComponentFixture<WizardAccountConfigurationInProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardAccountConfigurationInProgressComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(
      WizardAccountConfigurationInProgressComponent,
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
