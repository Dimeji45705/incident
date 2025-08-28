import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { User } from '../models/user.model';
import { LoginRequest, ApiAuthResponse, ApiUser } from '../models/auth.model';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {
    // Check for stored user on initialization
    const user = this.tokenStorage.getUser();
    if (user) {
      this.currentUserSubject.next(this.mapApiUserToLocalUser(user));
    }
  }
  
  /**
   * Maps the API user model to our local user model
   */
  private mapApiUserToLocalUser(apiUser: ApiUser): User {
    return {
      id: apiUser.id,
      email: apiUser.email,
      name: apiUser.name,
      role: apiUser.role as 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE',
      primaryDepartment: apiUser.primaryDepartment,
      additionalDepartments: apiUser.additionalDepartments || [],
      active: apiUser.active,
      createdAt: apiUser.createdAt,
      updatedAt: apiUser.updatedAt
    };
  }

  /**
   * Login using the API endpoint
   */
  login(credentials: LoginRequest): Observable<{user: User, token: string}> {
    return this.http.post<ApiAuthResponse>(
      `${environment.apiUrl}/auth/login`, 
      credentials
    ).pipe(
      tap(response => {
        const now = Date.now();
        const expiresAt = now + response.expiresIn;
        
        // Store token data
        const tokenData = {
          accessToken: response.accessToken,
          tokenType: response.tokenType,
          expiresAt: expiresAt,
          user: response.user
        };
        
        this.tokenStorage.saveToken(tokenData);
        this.tokenStorage.saveUser(response.user);
        
        // Update current user
        const user = this.mapApiUserToLocalUser(response.user);
        this.currentUserSubject.next(user);
      }),
      // Map the API response to the expected return format
      map(response => ({
        user: this.mapApiUserToLocalUser(response.user),
        token: response.accessToken
      }))
    );
  }

  logout(): void {
    this.tokenStorage.signOut();
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null && this.tokenStorage.isTokenValid();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  isSupervisor(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';
  }
}