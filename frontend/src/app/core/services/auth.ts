import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = '/api/auth';

  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromToken());
  currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: any) {
    const body = new URLSearchParams();
    body.set('username', credentials.email);
    body.set('password', credentials.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>(`${this.API_URL}/login`, body.toString(), { headers }).pipe(
      tap(res => {
        localStorage.setItem('token', res.access_token);
        this.currentUserSubject.next(this.getUserFromToken());
      })
    );
  }

  register(userData: any) {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getUserFromToken() {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (e) {
      return null;
    }
  }
  
  getProfile() {
    return this.http.get<any>(`${this.API_URL}/me`);
  }

  updateProfile(data: any) {
    return this.http.put(`${this.API_URL}/me`, data);
  }

  deleteAccount() {
    return this.http.delete(`${this.API_URL}/me`);
  }
}