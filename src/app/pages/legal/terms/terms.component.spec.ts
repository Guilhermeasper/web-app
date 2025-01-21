import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalTermsPageComponent } from './terms.component';

describe('LegalTermsPageComponent', () => {
  let component: LegalTermsPageComponent;
  let fixture: ComponentFixture<LegalTermsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalTermsPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LegalTermsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
