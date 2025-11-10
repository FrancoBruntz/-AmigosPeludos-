import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Refugio } from './refugio';

describe('Refugio', () => {
  let component: Refugio;
  let fixture: ComponentFixture<Refugio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Refugio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Refugio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
