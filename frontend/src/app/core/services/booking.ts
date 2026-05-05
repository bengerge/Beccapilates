import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/bookings';

  bookClass(classId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/${classId}`, {});
  }

  getMyBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/me`);
  }

  cancelBooking(bookingId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${bookingId}`);
  }

  modifyBooking(bookingId: number, newClassId: number): Observable<any> {
    const params = new HttpParams().set('new_class_id', newClassId.toString());
    
    return this.http.put(`${this.API_URL}/${bookingId}`, {}, { params });
  }
}