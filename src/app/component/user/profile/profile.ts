import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserProfile } from '../user.service';

@Component({
  selector: 'app-profile',
  standalone: true,         
  imports: [CommonModule],   
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  user: () => UserProfile | null = () => null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.user = this.userService.currentUser;
  }

  logout(): void {
    this.userService.logout();
  }
}
