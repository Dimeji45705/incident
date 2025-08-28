import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User, CreateUserRequest, UpdateUserRequest, UserPageResponse, UserFilter } from '../models/user.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Get users with pagination, sorting, and filtering
   */
  getUsers(
    page: number = 0,
    size: number = 20,
    sort: string = 'createdAt',
    direction: 'asc' | 'desc' = 'desc',
    filter?: UserFilter
  ): Observable<UserPageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort)
      .set('direction', direction);

    if (filter?.active !== undefined) {
      params = params.set('active', filter.active.toString());
    }
    
    if (filter?.role) {
      params = params.set('role', filter.role);
    }
    
    if (filter?.primaryDepartment) {
      params = params.set('primaryDepartment', filter.primaryDepartment);
    }
    
    if (filter?.searchTerm) {
      params = params.set('search', filter.searchTerm);
    }

    return this.http.get<UserPageResponse>(this.apiUrl, { params })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Create new user
   */
  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, request)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Update user
   */
  updateUser(id: string, updates: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, updates)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Delete user (deactivate)
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Toggle user active status
   */
  toggleUserStatus(id: string, active: boolean): Observable<User> {
    return this.updateUser(id, { active });
  }

  /**
   * Error handling
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid user data provided';
          break;
        case 401:
          errorMessage = 'You are not authorized to perform this action';
          break;
        case 403:
          errorMessage = 'You do not have permission to manage users';
          break;
        case 404:
          errorMessage = 'User not found';
          break;
        case 409:
          errorMessage = 'A user with this email already exists';
          break;
        case 500:
          errorMessage = 'Server error occurred while processing your request';
          break;
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
      }
    }
    
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }

  getDepartments(): Observable<string[]> {
    const departments = [
      'OPERATIONS_TEAM', 
      'COMPLIANCE_TEAM', 
      'FINANCE_TEAM', 
      'TECH_TEAM', 
      'GENERAL', 
      'VENDOR_MANAGEMENT', 
      'SECURITY_TEAM', 
      'PRODUCT_TEAM', 
      'CUSTOMER_SUPPORT'
    ];
    return of(departments);
  }
}