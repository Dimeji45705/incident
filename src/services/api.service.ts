import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  /**
   * Generic GET method
   * @param url API endpoint URL
   * @param params Optional query parameters
   * @param headers Optional HTTP headers
   * @returns Observable of response
   */
  get<T>(url: string, params?: any, headers?: HttpHeaders): Observable<T> {
    const options = {
      params: this.buildParams(params),
      headers
    };
    return this.http.get<T>(url, options).pipe(
      catchError(error => this.handleError<T>(error, `GET ${url}`))
    );
  }

  /**
   * Generic POST method
   * @param url API endpoint URL
   * @param body Request payload
   * @param headers Optional HTTP headers
   * @returns Observable of response
   */
  post<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(url, body, { headers }).pipe(
      catchError(error => this.handleError<T>(error, `POST ${url}`))
    );
  }

  /**
   * Generic PUT method
   * @param url API endpoint URL
   * @param body Request payload
   * @param headers Optional HTTP headers
   * @returns Observable of response
   */
  put<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(url, body, { headers }).pipe(
      catchError(error => this.handleError<T>(error, `PUT ${url}`))
    );
  }

  /**
   * Generic PATCH method
   * @param url API endpoint URL
   * @param body Request payload
   * @param headers Optional HTTP headers
   * @returns Observable of response
   */
  patch<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.patch<T>(url, body, { headers }).pipe(
      catchError(error => this.handleError<T>(error, `PATCH ${url}`))
    );
  }

  /**
   * Generic DELETE method
   * @param url API endpoint URL
   * @param headers Optional HTTP headers
   * @returns Observable of response
   */
  delete<T>(url: string, headers?: HttpHeaders): Observable<T> {
    return this.http.delete<T>(url, { headers }).pipe(
      catchError(error => this.handleError<T>(error, `DELETE ${url}`))
    );
  }

  /**
   * Helper method to build HttpParams from a plain object
   */
  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] != null) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return httpParams;
  }
  
  /**
   * Centralized error handler for API requests
   * @param error The error response
   * @param operation The operation that was attempted
   * @returns An observable with a user-facing error message
   */
  private handleError<T>(error: HttpErrorResponse, operation: string): Observable<never> {
    // Log the error details for debugging
    console.error(`${operation} failed:`, error);
    
    // Prepare a user-friendly error message
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} ${error.statusText}`;
      
      // Add response body error details if available
      if (error.error) {
        if (typeof error.error === 'string') {
          errorMessage += ` - ${error.error}`;
        } else if (error.error.message) {
          errorMessage += ` - ${error.error.message}`;
        }
      }
    }
    
    // Return a new error observable with the error message
    return throwError(() => new Error(errorMessage));
  }
}
