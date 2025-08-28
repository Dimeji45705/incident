import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ChangeRequest, CreateChangeRequestRequest, UpdateChangeRequestRequest, ApiChangeRequest, ChangeRequestPageResponse, ChangeRequestFilter } from '../models/change-request.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChangeRequestService {
  private apiUrl = `${environment.apiUrl}/change-requests`;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad Request: Please check your input';
          break;
        case 401:
          errorMessage = 'Unauthorized: Please log in again';
          break;
        case 403:
          errorMessage = 'Forbidden: You do not have permission to perform this action';
          break;
        case 404:
          errorMessage = 'Not Found: The requested change request could not be found';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflict: The change request cannot be processed in its current state';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation Error: Please check your input fields';
          break;
        case 500:
          errorMessage = 'Internal Server Error: Please try again later';
          break;
        default:
          errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }
    }
    
    console.error('Change Request Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }


  getChangeRequests(
    page: number = 0,
    size: number = 20,
    sort: string = 'createdAt',
    direction: string = 'desc',
    filter?: ChangeRequestFilter
  ): Observable<ChangeRequestPageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort)
      .set('direction', direction);

    // Add filter parameters if provided
    if (filter) {
      if (filter.status) {
        params = params.set('status', filter.status);
      }
      if (filter.assignedDepartment) {
        params = params.set('assignedDepartment', filter.assignedDepartment);
      }
      if (filter.incidentId) {
        params = params.set('incidentId', filter.incidentId);
      }
      if (filter.createdBy) {
        params = params.set('createdBy', filter.createdBy);
      }
    }

    return this.http.get<ChangeRequestPageResponse>(`${this.apiUrl}`, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getChangeRequestById(id: string): Observable<ChangeRequest> {
    return this.http.get<ApiChangeRequest>(`${this.apiUrl}/${id}`)
      .pipe(
        map(this.mapApiChangeRequestToLocal),
        catchError(this.handleError.bind(this))
      );
  }

  createChangeRequest(request: CreateChangeRequestRequest): Observable<ChangeRequest> {
    console.log('Creating change request with payload:', request);
    return this.http.post<ApiChangeRequest>(this.apiUrl, request)
      .pipe(
        map(this.mapApiChangeRequestToLocal),
        catchError(this.handleError.bind(this))
      );
  }

  updateChangeRequest(id: string, request: UpdateChangeRequestRequest): Observable<ChangeRequest> {
    return this.http.put<ApiChangeRequest>(`${this.apiUrl}/${id}`, request)
      .pipe(
        map(this.mapApiChangeRequestToLocal),
        catchError(this.handleError.bind(this))
      );
  }

  approveChangeRequest(id: string, notes?: string): Observable<ChangeRequest> {
    const payload = {
      notes: notes || 'Approved for implementation'
    };
    
    return this.http.post<ApiChangeRequest>(`${this.apiUrl}/${id}/approve`, payload)
      .pipe(
        map(this.mapApiChangeRequestToLocal),
        catchError(this.handleError.bind(this))
      );
  }

  rejectChangeRequest(id: string, notes?: string): Observable<ChangeRequest> {
    const payload = {
      notes: notes || 'Change request rejected'
    };
    
    return this.http.post<ApiChangeRequest>(`${this.apiUrl}/${id}/reject`, payload)
      .pipe(
        map(this.mapApiChangeRequestToLocal),
        catchError(this.handleError.bind(this))
      );
  }

  completeChangeRequest(id: string, notes?: string): Observable<ChangeRequest> {
    const payload = {
      notes: notes || 'Change request completed'
    };
    
    return this.http.post<ApiChangeRequest>(`${this.apiUrl}/${id}/complete`, payload)
      .pipe(
        map(this.mapApiChangeRequestToLocal),
        catchError(this.handleError.bind(this))
      );
  }

  deleteChangeRequest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Maps API change request to local change request format
   */
  private mapApiChangeRequestToLocal(apiChangeRequest: ApiChangeRequest): ChangeRequest {
    return {
      id: apiChangeRequest.id,
      number: apiChangeRequest.number,
      title: apiChangeRequest.title,
      description: apiChangeRequest.description,
      status: apiChangeRequest.status,
      incidentId: apiChangeRequest.incidentId,
      assignedDepartment: apiChangeRequest.assignedDepartment,
      createdBy: apiChangeRequest.createdBy,
      approvedBy: apiChangeRequest.approvedBy,
      completedBy: apiChangeRequest.completedBy,
      createdAt: apiChangeRequest.createdAt,
      updatedAt: apiChangeRequest.updatedAt,
      approvedAt: apiChangeRequest.approvedAt,
      completedAt: apiChangeRequest.completedAt,
      notes: apiChangeRequest.notes
    };
  }
}