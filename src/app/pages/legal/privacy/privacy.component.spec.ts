import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalPrivacyPageComponent } from './privacy.component';

describe('LegalPrivacyPageComponent', () => {
  let component: LegalPrivacyPageComponent;
  let fixture: ComponentFixture<LegalPrivacyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalPrivacyPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LegalPrivacyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
