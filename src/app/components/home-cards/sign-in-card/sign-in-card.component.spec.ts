import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInCardComponent } from './sign-in-card.component';

describe('SignInCardComponent', () => {
  let component: SignInCardComponent;
  let fixture: ComponentFixture<SignInCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SignInCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
