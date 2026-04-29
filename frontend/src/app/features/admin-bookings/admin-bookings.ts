import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-bookings.html',
  styleUrls: ['./admin-bookings.scss']
})
export class AdminBookingsComponent implements OnInit {
  private adminService = inject(AdminService);
  bookings: any[] = [];

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.adminService.getAllBookings().subscribe({
      next: (data) => {
        this.bookings = data.sort((a, b) => 
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );
      }
    });
  }
}