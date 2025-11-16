import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoritesComponent } from './favorites';
import { UserService } from '../user.service';

describe('FavoritesComponent', () => {
  let component: FavoritesComponent;
  let fixture: ComponentFixture<FavoritesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritesComponent],
      providers: [UserService]
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create favorites component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a remove method', () => {
    expect(typeof component.remove).toBe('function');
  });
});
