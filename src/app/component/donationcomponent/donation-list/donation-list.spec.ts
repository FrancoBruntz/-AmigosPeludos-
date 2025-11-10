import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationList } from './donation-list';

describe('DonationList', () => {
  let component: DonationList;
  let fixture: ComponentFixture<DonationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonationList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
