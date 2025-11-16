import { TestBed } from '@angular/core/testing';

import { Solicitudesservice } from './solicitudesservice';

describe('Solicitudesservice', () => {
  let service: Solicitudesservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Solicitudesservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
