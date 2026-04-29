import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}