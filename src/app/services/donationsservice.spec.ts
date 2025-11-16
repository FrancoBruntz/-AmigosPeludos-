import { TestBed } from '@angular/core/testing';

import { Donationsservice } from './donationsservice';

describe('Donationsservice', () => {
  let service: Donationsservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Donationsservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
