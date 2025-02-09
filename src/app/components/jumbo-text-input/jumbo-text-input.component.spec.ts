import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JumboTextInputComponent } from './jumbo-text-input.component';

describe('JumboTextInputComponent', () => {
  let component: JumboTextInputComponent;
  let fixture: ComponentFixture<JumboTextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JumboTextInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JumboTextInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
