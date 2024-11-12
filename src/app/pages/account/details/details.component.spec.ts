import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDetailsPageComponent } from './details.component';

describe('AccountDetailsPageComponent', () => {
  let component: AccountDetailsPageComponent;
  let fixture: ComponentFixture<AccountDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountDetailsPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
