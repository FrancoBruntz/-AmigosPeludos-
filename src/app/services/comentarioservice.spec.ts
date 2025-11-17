import { TestBed } from '@angular/core/testing';

import { Comentarioservice } from './comentarioservice';

describe('Comentarioservice', () => {
  let service: Comentarioservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Comentarioservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
