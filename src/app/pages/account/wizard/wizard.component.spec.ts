import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountWizardPageComponent } from './wizard.component';

describe('AccountWizardPageComponent', () => {
  let component: AccountWizardPageComponent;
  let fixture: ComponentFixture<AccountWizardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountWizardPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountWizardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
