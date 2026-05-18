import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, map, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = '/api/auth';


  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: any): Observable<any> {
    const body = new URLSearchParams();
    body.set('username', credentials.email);
    body.set('password', credentials.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>(`${this.API_URL}/login`, body.toString(), { 
      headers,
      withCredentials: true
    }).pipe(
      tap(() => {

        this.checkAuthStatus().subscribe();
      })
    );
  }

  register(userData: any) {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  logout() {

    this.http.post(`${this.API_URL}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  private clearSession() {
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }


  checkAuthStatus(): Observable<boolean> {
    return this.http.get<any>(`${this.API_URL}/me`, { withCredentials: true }).pipe(
      tap(user => {

        this.currentUserSubject.next(user);
      }),
      map(() => true),
      catchError(() => {

        this.currentUserSubject.next(null);
        return of(false);
      })
    );
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  getProfile() {
    return this.http.get<any>(`${this.API_URL}/me`, { withCredentials: true });
  }

  updateProfile(data: any) {
    return this.http.put(`${this.API_URL}/me`, data, { withCredentials: true });
  }

  deleteAccount() {
    return this.http.delete(`${this.API_URL}/me`, { withCredentials: true });
  }
}