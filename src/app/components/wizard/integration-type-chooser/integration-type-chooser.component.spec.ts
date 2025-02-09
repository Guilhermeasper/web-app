import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardIntegrationTypeChooserComponent } from './integration-type-chooser.component';

describe('WizardIntegrationTypeChooserComponent', () => {
  let component: WizardIntegrationTypeChooserComponent;
  let fixture: ComponentFixture<WizardIntegrationTypeChooserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardIntegrationTypeChooserComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardIntegrationTypeChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
