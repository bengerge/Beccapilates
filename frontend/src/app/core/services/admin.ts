import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  
  private readonly ADMIN_API_URL = '/api/admin';

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.ADMIN_API_URL}/users`);
  }

  updateUserRole(userId: number, role: string): Observable<any> {
    return this.http.put(`${this.ADMIN_API_URL}/users/${userId}/role`, { role });
  }

  getAllBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.ADMIN_API_URL}/bookings`);
  }

  getClasses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.ADMIN_API_URL}/classes`);
  }

  createClass(classData: any): Observable<any> {
    return this.http.post(`${this.ADMIN_API_URL}/classes`, classData);
  }

  deleteClass(classId: number): Observable<any> {
    return this.http.delete(`${this.ADMIN_API_URL}/classes/${classId}`, { responseType: 'text' });
  }

  updateClass(classId: number, data: any): Observable<any> {
    return this.http.put(`${this.ADMIN_API_URL}/classes/${classId}`, data);
  }
  
  getAttendees(classId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.ADMIN_API_URL}/classes/${classId}/attendees`);
  }

  deleteBooking(bookingId: number): Observable<any> {
    return this.http.delete(`${this.ADMIN_API_URL}/bookings/${bookingId}`, { responseType: 'text' });
  }

  addExternalBooking(classId: number, guestName: string): Observable<any> {
    return this.http.post<any>(`${this.ADMIN_API_URL}/external`, {
      class_id: classId,
      guest_name: guestName
    });
  }

  getLocations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.ADMIN_API_URL}/locations`);
  }

  createLocation(name: string): Observable<any> {
    return this.http.post(`${this.ADMIN_API_URL}/locations`, { name });
  }

  deleteLocation(locationId: number): Observable<any> {
    return this.http.delete(`${this.ADMIN_API_URL}/locations/${locationId}`);
  }

  getDifficulties(): Observable<any[]> {
    return this.http.get<any[]>(`${this.ADMIN_API_URL}/difficulties`);
  }

  createDifficulty(name: string): Observable<any> {
    return this.http.post(`${this.ADMIN_API_URL}/difficulties`, { name });
  }

  deleteDifficulty(difficultyId: number): Observable<any> {
    return this.http.delete(`${this.ADMIN_API_URL}/difficulties/${difficultyId}`);
  }
}