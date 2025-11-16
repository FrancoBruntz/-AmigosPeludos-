import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsComponent } from './notifications';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsComponent, CommonModule]  // Si es standalone
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial notifications', () => {
    expect(component.notifications.length).toBeGreaterThan(0);
  });

  it('should mark a notification as read', () => {
    const notification = component.notifications[0];
    component.markAsRead(notification);
    expect(notification.read).toBeTrue();
  });

  it('should clear all notifications', () => {
    component.clearNotifications();
    expect(component.notifications.length).toBe(0);
  });
});
