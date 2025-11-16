import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../user.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let userService: UserService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [RouterTestingModule], // <- necesario porque UserService injecta Router
      providers: [UserService]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    fixture.detectChanges();
  });

  it('debería crearse el componente correctamente', () => {
    expect(component).toBeTruthy();
  });
});
