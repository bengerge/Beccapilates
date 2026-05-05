import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-bookings.html',
  styleUrls: ['./admin-bookings.scss']
})
export class AdminBookingsComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  classes: any[] = [];
  currentWeekStart: Date = new Date();
  realWeekStart: Date = new Date();
  weekDays: Date[] = [];
  
  selectedClass: any = null;
  attendees: any[] = [];
  isEditing = false;
  isConfirmingDelete = false;
  
  confirmingAttendeeId: number | null = null;
  
  editForm!: FormGroup;

  difficultyMap: Record<string, string> = {
    'beginner': 'Kezdő',
    'intermediate': 'Középhaladó',
    'advanced': 'Haladó'
  };

  ngOnInit() {
    this.setWeekToCurrent();
    this.realWeekStart = new Date(this.currentWeekStart);
    this.loadClasses();
    this.initForm();
  }

  initForm() {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      difficulty: ['beginner', Validators.required],
      location: ['', Validators.required],
      max_capacity: [10, [Validators.required, Validators.min(1)]],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required]
    });
  }

  loadClasses() {
    this.adminService.getClasses().subscribe({
      next: (data) => this.classes = data,
      error: () => this.toastService.show('Nem sikerült betölteni az órákat.', 'error')
    });
  }

  setWeekToCurrent() {
    const today = new Date();
    const day = today.getDay() || 7;
    if (day !== 1) today.setHours(-24 * (day - 1));
    this.currentWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    this.generateWeekDays();
  }

  get canGoBack(): boolean {
    return this.currentWeekStart.getTime() > this.realWeekStart.getTime();
  }

  changeWeek(offset: number) {
    if (offset === -1 && !this.canGoBack) return;
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + (offset * 7));
    this.currentWeekStart = new Date(this.currentWeekStart);
    this.generateWeekDays();
  }

  generateWeekDays() {
    this.weekDays = Array.from({length: 7}, (_, i) => {
      const d = new Date(this.currentWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }

  getClassesForDay(date: Date): any[] {
    return this.classes.filter(c => {
      const cDate = new Date(c.start_time);
      return cDate.getFullYear() === date.getFullYear() &&
             cDate.getMonth() === date.getMonth() &&
             cDate.getDate() === date.getDate();
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  openClassDetails(session: any) {
    this.selectedClass = session;
    this.isEditing = false;
    this.isConfirmingDelete = false;
    this.confirmingAttendeeId = null;
    this.adminService.getAttendees(session.id).subscribe({
      next: (data) => this.attendees = data,
      error: () => this.toastService.show('Hiba a résztvevők betöltésekor.', 'error')
    });
  }

  closeModal() {
    this.selectedClass = null;
    this.attendees = [];
    this.isEditing = false;
    this.isConfirmingDelete = false;
    this.confirmingAttendeeId = null;
  }

  startEditing() {
    this.isEditing = true;
    this.isConfirmingDelete = false;
    this.confirmingAttendeeId = null;
    this.editForm.patchValue({
      name: this.selectedClass.name,
      difficulty: this.selectedClass.difficulty,
      location: this.selectedClass.location,
      max_capacity: this.selectedClass.max_capacity,
      start_time: this.selectedClass.start_time.substring(0, 16),
      end_time: this.selectedClass.end_time ? this.selectedClass.end_time.substring(0, 16) : ''
    });
  }

  saveEdit() {
    if (this.editForm.valid) {
      this.adminService.updateClass(this.selectedClass.id, this.editForm.value).subscribe({
        next: () => {
          this.toastService.show('Óra sikeresen módosítva!', 'success');
          this.loadClasses();
          this.closeModal();
        },
        error: () => this.toastService.show('Hiba a módosítás mentésekor.', 'error')
      });
    }
  }

  deleteClass() {
    this.adminService.deleteClass(this.selectedClass.id).subscribe({
      next: () => {
        this.toastService.show('Óra véglegesen törölve.', 'success');
        this.loadClasses();
        this.closeModal();
      },
      error: () => this.toastService.show('Hiba az óra törlésekor.', 'error')
    });
  }

  removeAttendee(bookingId: number) {
    this.adminService.deleteBooking(bookingId).subscribe({
      next: () => {
        this.attendees = this.attendees.filter(a => a.booking_id !== bookingId);
        if (this.selectedClass) {
          this.selectedClass.current_bookings--;
        }
        this.toastService.show('Vendég eltávolítva az óráról.', 'success');
        this.confirmingAttendeeId = null;
        this.loadClasses();
      },
      error: () => this.toastService.show('Hiba a vendég eltávolításakor.', 'error')
    });
  }

  getDifficulty(level: string): string { 
    return this.difficultyMap[level] || level; 
  }
}