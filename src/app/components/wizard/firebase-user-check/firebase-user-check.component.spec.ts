import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardFirebaseUserCheckComponent } from './firebase-user-check.component';

describe('WizardFirebaseUserCheckComponent', () => {
  let component: WizardFirebaseUserCheckComponent;
  let fixture: ComponentFixture<WizardFirebaseUserCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardFirebaseUserCheckComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardFirebaseUserCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
