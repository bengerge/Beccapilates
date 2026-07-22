import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../core/services/booking';
import { ClassService } from '../../core/services/class';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bookings.html',
  styleUrls: ['./bookings.scss']
})
export class BookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private classService = inject(ClassService);
  private toastService = inject(ToastService);

  myBookings: any[] = [];
  availableClasses: any[] = [];
  
  isModifying = false;
  selectedBookingId: number | null = null;
  
  confirmingSwapId: number | null = null;
  confirmingCancelId: number | null = null;

  ngOnInit() {
    this.loadMyBookings();
  }

  loadMyBookings() {
    this.bookingService.getMyBookings().subscribe({
      next: (data) => {
        this.myBookings = data.sort((a: any, b: any) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
      },
      error: () => this.toastService.show('Nem sikerült betölteni a foglalásaidat.', 'error')
    });
  }

  isWithin24Hours(startTime: string): boolean {
    const classTime = new Date(startTime).getTime();
    const now = new Date().getTime();
    const diffHours = (classTime - now) / (1000 * 60 * 60);
    return diffHours < 24;
  }

  cancelBooking(bookingId: number) {
    this.bookingService.cancelBooking(bookingId).subscribe({
      next: () => {
        this.toastService.show('Foglalás sikeresen lemondva.', 'success');
        this.confirmingCancelId = null;
        this.loadMyBookings();
      },
      error: (err) => this.toastService.show(err.error?.detail || 'Hiba a lemondás során.', 'error')
    });
  }

  startModification(bookingId: number) {
    this.loadAvailableClasses();
    this.selectedBookingId = bookingId;
    this.isModifying = true;
    this.confirmingSwapId = null;
    
  }

  loadAvailableClasses() {
    this.classService.getClasses().subscribe({
      next: (data) => {
        const now = new Date();
        
        const bookedSessionIds = new Set(
          this.myBookings
            .map(b => b.class_session_id)
            .filter(id => id !== undefined && id !== null)
        );

        this.availableClasses = data.filter(c => {
          const isFuture = new Date(c.start_time) > now;
          
          const isAlreadyBooked = bookedSessionIds.has(c.id);

          return isFuture && !isAlreadyBooked;
        });
      },
      error: () => this.toastService.show('Hiba az órák betöltésekor.', 'error')
    });
  }

  confirmSwap(newClassId: number) {
    if (!this.selectedBookingId) return;

    this.bookingService.modifyBooking(this.selectedBookingId, newClassId).subscribe({
      next: () => {
        this.toastService.show('Időpont sikeresen módosítva!', 'success');
        this.isModifying = false;
        this.selectedBookingId = null;
        this.confirmingSwapId = null;
        this.loadMyBookings();
      },
      error: (err) => {
        this.toastService.show(err.error?.detail || 'Hiba a módosítás során.', 'error');
        this.confirmingSwapId = null;
      }
    });
  }
}