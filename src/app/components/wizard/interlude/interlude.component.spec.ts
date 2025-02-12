import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardInterludeComponent } from './interlude.component';

describe('WizardInterludeComponent', () => {
  let component: WizardInterludeComponent;
  let fixture: ComponentFixture<WizardInterludeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardInterludeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardInterludeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
