import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, LoginRequest, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check for stored user on service initialization
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Mock authentication - in real app, this would call an API
    const mockUser: User = {
      id: '1',
      email: credentials.email,
      name: 'John Doe',
      role: credentials.email === 'admin@company.com' ? 'admin' : 'user',
      primaryDepartment: 'IT',
      additionalDepartments: ['Security'],
      isActive: true,
      isSupervisor: credentials.email === 'admin@company.com',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const response: AuthResponse = {
      user: mockUser,
      token: 'mock-jwt-token'
    };

    // Store user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('token', response.token);
    
    this.currentUserSubject.next(mockUser);
    
    return of(response);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  isSupervisor(): boolean {
    const user = this.getCurrentUser();
    return user?.isSupervisor || user?.role === 'admin';
  }
}