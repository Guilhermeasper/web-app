import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountLoginPageComponent } from './login.component';

describe('AccountLoginPageComponent', () => {
  let component: AccountLoginPageComponent;
  let fixture: ComponentFixture<AccountLoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountLoginPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountLoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
