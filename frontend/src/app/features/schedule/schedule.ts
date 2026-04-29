import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassService, ClassSession } from '../../core/services/class';
import { BookingService } from '../../core/services/booking';
import { AuthService } from '../../core/services/auth';
import { UiService } from '../../core/services/ui';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.scss']
})
export class ScheduleComponent implements OnInit {
  private classService = inject(ClassService);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private uiService = inject(UiService);

  classes: ClassSession[] = [];
  currentWeekStart: Date = new Date();
  realWeekStart: Date = new Date();
  weekDays: Date[] = [];
  isLoggedIn = false;

  ngOnInit() {
    this.setWeekToCurrent();
    this.realWeekStart = new Date(this.currentWeekStart.getTime());
    this.loadClasses();

    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  loadClasses() {
    this.classService.getClasses().subscribe({
      next: (data) => this.classes = data
    });
  }

  setWeekToCurrent() {
    const today = new Date();
    const day = today.getDay() || 7;
    
    if (day !== 1) {
      today.setHours(-24 * (day - 1));
    }
    
    this.currentWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    this.generateWeekDays();
  }

  changeWeek(offset: number) {
    if (offset === -1 && !this.canGoBack) return;

    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + (offset * 7));
    this.currentWeekStart = new Date(this.currentWeekStart);
    this.generateWeekDays();
  }

  generateWeekDays() {
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(date.getDate() + i);
      this.weekDays.push(date);
    }
  }

  getClassesForDay(date: Date): ClassSession[] {
    return this.classes.filter(c => {
      const classDate = new Date(c.start_time);
      return classDate.getFullYear() === date.getFullYear() &&
             classDate.getMonth() === date.getMonth() &&
             classDate.getDate() === date.getDate();
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  get canGoBack(): boolean {
    return this.currentWeekStart.getTime() > this.realWeekStart.getTime();
  }

  openBooking(session: ClassSession) {
    if (!this.isLoggedIn) {
      this.uiService.openAuthModal();
      return;
    }

    if (session.current_bookings >= session.max_capacity) {
      alert('Sajnos ez az óra már betelt.');
      return;
    }

    if (confirm(`Szeretnéd lefoglalni ezt az órát: ${session.name}?`)) {
      this.bookingService.bookClass(session.id).subscribe({
        next: () => {
          alert('Sikeres foglalás! Várunk szeretettel.');
          this.loadClasses();
        },
        error: (err) => {
          alert(err.error?.detail || 'Hiba történt a foglalás során.');
        }
      });
    }
  }
}