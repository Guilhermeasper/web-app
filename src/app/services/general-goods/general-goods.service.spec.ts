import { TestBed } from '@angular/core/testing';

import { GeneralGoodsService } from './general-goods.service';

describe('GeneralGoodsService', () => {
  let service: GeneralGoodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneralGoodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
