import { TestBed } from '@angular/core/testing';

import { Petsservice } from './petsservice';

describe('Petsservice', () => {
  let service: Petsservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Petsservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
