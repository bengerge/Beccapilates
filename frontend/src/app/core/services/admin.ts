import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/admin';

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/users`);
  }

  updateUserRole(userId: number, role: string): Observable<any> {
    return this.http.put(`${this.API_URL}/users/${userId}/role`, { role });
  }

  getAllBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/bookings`);
  }

  createClass(classData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/classes`, classData);
  }

  deleteClass(classId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/classes/${classId}`);
  }
}