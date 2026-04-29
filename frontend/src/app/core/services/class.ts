import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClassSession {
  id: number;
  name: string;
  difficulty: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  location: string;
  description?: string;
  current_bookings: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClassService {

  private http = inject(HttpClient);
  private readonly API_URL = '/api/classes';

  getClasses(): Observable<ClassSession[]> {
    return this.http.get<ClassSession[]>(this.API_URL);
  }

  bookClass(classId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/${classId}/book`, {});
  }
  
  getMyBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/my-bookings`);
  }
}