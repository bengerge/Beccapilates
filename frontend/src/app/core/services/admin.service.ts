import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/admin/classes'; 

  getClasses(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }

  getAttendees(classId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/${classId}/attendees`);
  }

  deleteClass(classId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${classId}`, { responseType: 'text' });
  }

  updateClass(classId: number, classData: any): Observable<any> {
    return this.http.put(`${this.API_URL}/${classId}`, classData);
  }
}