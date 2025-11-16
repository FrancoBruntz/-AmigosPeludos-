import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgUpload } from './img-upload';

describe('ImgUpload', () => {
  let component: ImgUpload;
  let fixture: ComponentFixture<ImgUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImgUpload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImgUpload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
