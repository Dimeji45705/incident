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
    // Map API role to one of our app roles ('admin', 'supervisor', 'user')
    let role: 'admin' | 'supervisor' | 'EMPLOYEE' | 'user' = 'user';
    let isSupervisor = false;
    
    // Log the raw API role for debugging
    console.log('DEBUG - API User:', apiUser);
    console.log('DEBUG - API User Role:', apiUser.role, 'Type:', typeof apiUser.role);
    
    // Make sure the role is a string and normalize to uppercase for comparison
    const apiRole = String(apiUser.role || '').toUpperCase().trim();
    console.log('DEBUG - Normalized API Role:', apiRole);
    
    // Check for various role formats that might indicate admin/supervisor privileges
    if (['ADMIN', 'ADMINISTRATOR'].includes(apiRole)) {
      role = 'admin';
      isSupervisor = true;
      console.log('DEBUG - Role mapped to admin');
    } else if (['SUPERVISOR', 'SUPER', 'MANAGER', 'LEAD'].includes(apiRole)) {
      role = 'supervisor';
      isSupervisor = true;
      console.log('DEBUG - Role mapped to supervisor');
    } else if (['EMPLOYEE', 'STAFF', 'WORKER'].includes(apiRole)) {
      role = 'EMPLOYEE';
      console.log('DEBUG - Role mapped to EMPLOYEE');
    } else {
      // Check if there are any other properties that might indicate supervisor status
      const userObj = apiUser as any; // Use any to check for possible non-standard properties
      if (userObj.isAdmin === true || userObj.is_admin === true) {
        role = 'admin';
        isSupervisor = true;
        console.log('DEBUG - Role mapped to admin via isAdmin property');
      } else if (userObj.isSupervisor === true || userObj.is_supervisor === true) {
        role = 'supervisor';
        isSupervisor = true;
        console.log('DEBUG - Role mapped to supervisor via isSupervisor property');
      } else if (userObj.isEmployee === true || userObj.is_employee === true) {
        role = 'EMPLOYEE';
        console.log('DEBUG - Role mapped to EMPLOYEE via isEmployee property');
      } else {
        console.log('DEBUG - Role defaulted to regular user');
      }
    }
    
    return {
      id: apiUser.id,
      email: apiUser.email,
      name: apiUser.name,
      role: role,
      primaryDepartment: apiUser.primaryDepartment,
      additionalDepartments: apiUser.additionalDepartments || [],
      isActive: apiUser.active,
      isSupervisor: isSupervisor, // Use our explicitly calculated flag
      createdAt: new Date(apiUser.createdAt || Date.now()),
      updatedAt: new Date(apiUser.updatedAt || Date.now())
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
    return user?.role === 'admin';
  }

  isSupervisor(): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      console.log('DEBUG - isSupervisor check: No user found');
      return false;
    }
    
    const isAdmin = user.role === 'admin';
    const isSupervisorRole = user.role === 'supervisor';
    const hasSupervisorFlag = user.isSupervisor === true;
    const finalResult = isAdmin || isSupervisorRole || hasSupervisorFlag;
    
    console.log('DEBUG - isSupervisor check:', { 
      userRole: user.role, 
      userRoleType: typeof user.role,
      isSupervisorFlag: user.isSupervisor,
      isAdmin,
      isSupervisorRole,
      hasSupervisorFlag,
      finalResult,
      fullUser: user
    });
    
    // Check for either the role being 'supervisor'/'admin' or the isSupervisor flag
    return finalResult;
  }
}