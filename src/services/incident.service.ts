import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, catchError, map } from 'rxjs';
import { Incident, CreateIncidentRequest, UpdateIncidentRequest, CreateCommentRequest, IncidentComment, IncidentAttachment } from '../models/incident.model';
import { PageResponse } from '../models/page-response.model';
import { ApiService } from './api.service';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

// Define interface for filter parameters
export interface IncidentFilter {
  status?: string;
  severity?: string;
  department?: string;
  category?: string;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private incidentsSubject = new BehaviorSubject<Incident[]>([]);
  public incidents$ = this.incidentsSubject.asObservable();
  
  private apiUrl = `/api/v1/incidents`;
  
  // Store pagination info
  private currentPage: number = 0;
  private pageSize: number = 20;
  private totalPages: number = 0;
  private totalElements: number = 0;
  
  // Store status counts
  private statusCounts: {[key: string]: number} = {};
  private sortField = 'createdAt';
  private sortDirection = 'desc';
  
  // Filter state
  private filters: IncidentFilter = {};

  constructor(private apiService: ApiService, private http: HttpClient) {
    // Initialize with mock data immediately to avoid loading state
    this.totalPages = 1;
    this.totalElements = 0;
    this.incidentsSubject.next([]);
  }


  /**
   * Load incidents from the API with pagination and filtering
   */
  private loadIncidents(page: number = 0, size: number = 20, sort: string = 'createdAt', direction: string = 'desc', filters: IncidentFilter = {}): Observable<Incident[]> {
    this.currentPage = page;
    this.pageSize = size;
    this.sortField = sort;
    this.sortDirection = direction;
    this.filters = {...this.filters, ...filters};
    
    // Build request parameters
    const params: Record<string, string> = {
      page: page.toString(),
      size: size.toString(),
      sort: sort,
      direction: direction
    };
    
    // Add filter parameters if they exist
    if (this.filters.status) params['status'] = this.filters.status;
    if (this.filters.severity) params['severity'] = this.filters.severity;
    if (this.filters.department) params['department'] = this.filters.department;
    if (this.filters.category) params['category'] = this.filters.category;
    if (this.filters.searchTerm) params['searchTerm'] = this.filters.searchTerm;
    if (this.filters.startDate) params['startDate'] = this.filters.startDate;
    if (this.filters.endDate) params['endDate'] = this.filters.endDate;
    
    return this.apiService.get<PageResponse<Incident>>(`${this.apiUrl}`, params)
      .pipe(
        tap(response => {
          // Update pagination state
          if (response) {
            this.totalPages = response.totalPages;
            this.totalElements = response.totalElements;
            
            // Update incidents in the subject
            this.incidentsSubject.next(response.content);
          }
        }),
        map(response => response ? response.content : []),
        catchError(error => {
          console.error('Error loading incidents from API:', error);
          // Reset pagination and return empty array to show empty state
          this.totalPages = 0;
          this.totalElements = 0;
          this.incidentsSubject.next([]);
          return of([]);
        })
      );
  }

  /**
   * Get all incidents (paginated and filtered)
   */
  getIncidents(page?: number, size?: number, sort?: string, direction?: string, filters?: IncidentFilter): Observable<Incident[]> {
    // Return the API call directly so the component can handle loading states
    return this.loadIncidents(
      page || this.currentPage,
      size || this.pageSize,
      sort || this.sortField,
      direction || this.sortDirection,
      filters || {}
    );
  }
  
  /**
   * Get pagination info
   */
  getPaginationInfo(): { currentPage: number; pageSize: number; totalPages: number; totalElements: number } {
    return {
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      totalPages: this.totalPages,
      totalElements: this.totalElements
    };
  }

  /**
   * Get status counts from the API
   */
  getStatusCounts(): Observable<{[key: string]: number}> {
    const filters = {...this.filters};
    // Remove status filter to get counts for all statuses
    delete filters.status;
    
    const params: Record<string, string> = {
      page: '0',
      size: '1', // We only need counts, not data
      countOnly: 'true'
    };
    
    // Add filter parameters
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof IncidentFilter]) {
        params[key] = filters[key as keyof IncidentFilter] as string;
      }
    });

    return this.apiService.get<any>(`${this.apiUrl}/counts`, params).pipe(
      map(response => response.statusCounts || {}),
      tap(counts => {
        this.statusCounts = counts;
      }),
      catchError(error => {
        console.error('Error loading status counts:', error);
        return of({});
      })
    );
  }

  /**
   * Get cached status counts
   */
  getCachedStatusCounts(): {[key: string]: number} {
    return this.statusCounts;
  }
  
  /**
   * Navigate to a specific page
   */
  goToPage(page: number): Observable<Incident[]> {
    if (page < 1 || (this.totalPages > 0 && page > this.totalPages)) {
      return this.incidents$;
    }
    
    this.loadIncidents(page, this.pageSize, this.sortField, this.sortDirection, this.filters);
    return this.incidents$;
  }
  
  /**
   * Change the sort order
   */
  sortBy(field: string, direction: 'asc' | 'desc' = 'desc'): Observable<Incident[]> {
    this.loadIncidents(1, this.pageSize, field, direction, this.filters);
    return this.incidents$;
  }
  
  /**
   * Apply filters to incidents
   * @param filters Filter criteria to apply
   * @param sortField Optional field to sort by
   * @param sortDirection Optional sort direction ('asc' or 'desc')
   */
  applyFilters(filters: IncidentFilter, sortField?: string, sortDirection?: string): Observable<Incident[]> {
    // Reset to first page when applying new filters
    return this.loadIncidents(1, this.pageSize, sortField || this.sortField, sortDirection || this.sortDirection, filters);
  }
  
  /**
   * Get current filters
   */
  getFilters(): IncidentFilter {
    return { ...this.filters };
  }
  
  /**
   * Clear all filters
   */
  clearFilters(): Observable<Incident[]> {
    this.filters = {};
    this.loadIncidents(0, this.pageSize, this.sortField, this.sortDirection, {});
    return this.incidents$;
  }

  /**
   * Get incident by ID
   */
  getIncidentById(id: string): Observable<Incident> {
    return this.apiService.get<Incident>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error getting incident ${id}:`, error);
        return of(null as unknown as Incident);
      })
    );
  }

  /**
   * Create a new incident
   */
  createIncident(request: CreateIncidentRequest): Observable<Incident> {
    return this.apiService.post<Incident>(this.apiUrl, request).pipe(
      map(response => {
        if (!response || typeof response !== 'object') {
          console.error('Invalid incident response from API:', response);
          throw new Error('Invalid response from server');
        }
        return response as Incident;
      }),
      tap(incident => {
        if (incident) {
          const incidents = this.incidentsSubject.getValue();
          incidents.unshift(incident);
          this.incidentsSubject.next([...incidents]);
        }
      }),
      catchError(error => {
        console.error('Error creating incident:', error);
        return of(null as unknown as Incident);
      })
    );
  }

  /**
   * Update an existing incident
   */
  updateIncident(id: string, request: UpdateIncidentRequest): Observable<Incident> {
    return this.apiService.patch<Incident>(`${this.apiUrl}/${id}`, request).pipe(
      tap(updatedIncident => {
        const incidents = this.incidentsSubject.getValue();
        const index = incidents.findIndex(i => i.id === id);
        if (index !== -1) {
          incidents[index] = updatedIncident;
          this.incidentsSubject.next([...incidents]);
        }
      }),
      catchError(error => {
        console.error(`Error updating incident ${id}:`, error);
        return of(null as unknown as Incident);
      })
    );
  }

  /**
   * Delete an incident
   */
  deleteIncident(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const incidents = this.incidentsSubject.getValue();
        const filteredIncidents = incidents.filter(incident => incident.id !== id);
        this.incidentsSubject.next(filteredIncidents);
      }),
      catchError(error => {
        console.error(`Error deleting incident ${id}:`, error);
        return of(undefined);
      })
    );
  }

  /**
   * Add a comment to an incident
   */
  addComment(incidentId: string, request: CreateCommentRequest): Observable<IncidentComment> {
    // Use the reverse proxy to avoid CORS issues
    const commentEndpoint = `/api/v1/incidents/${incidentId}/comments`;
    
    return this.apiService.post<IncidentComment>(commentEndpoint, request).pipe(
      tap(comment => {
        console.log('Comment added:', comment);
        // Update the local incident with the new comment
        const incidents = this.incidentsSubject.getValue();
        const incident = incidents.find(i => i.id === incidentId);
        if (incident && incident.comments) {
          incident.comments.push(comment);
          this.incidentsSubject.next([...incidents]);
        }
      }),
      catchError(error => {
        console.error(`Error adding comment to incident ${incidentId}:`, error);
        return of(null as unknown as IncidentComment);
      })
    );
  }
  
  /**
   * Upload an attachment to an incident
   */
  uploadAttachment(incidentId: string, file: File, description: string): Observable<IncidentAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Set up the endpoint URL with the description as a query parameter
    const uploadEndpoint = `/api/v1/incidents/${incidentId}/attachments`;
    let params = new HttpParams();
    if (description) {
      params = params.set('description', description);
    }
    
    return this.http.post<IncidentAttachment>(uploadEndpoint, formData, { params }).pipe(
      tap(attachment => {
        console.log('Attachment uploaded:', attachment);
        // Update the local incident with the new attachment
        const incidents = this.incidentsSubject.getValue();
        const incident = incidents.find(i => i.id === incidentId);
        if (incident) {
          if (!incident.attachments) {
            incident.attachments = [];
          }
          incident.attachments.push(attachment);
          this.incidentsSubject.next([...incidents]);
        }
      }),
      catchError(error => {
        console.error(`Error uploading attachment to incident ${incidentId}:`, error);
        return of(null as unknown as IncidentAttachment);
      })
    );
  }
  
  /**
   * Download an attachment
   */
  downloadAttachment(incidentId: string, attachmentId: string): Observable<Blob> {
    const downloadEndpoint = `/api/v1/incidents/${incidentId}/attachments/${attachmentId}`;
    return this.http.get(downloadEndpoint, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error(`Error downloading attachment ${attachmentId}:`, error);
        return of(new Blob());
      })
    );
  }
  
  /**
   * Delete an attachment
   */
  deleteAttachment(incidentId: string, attachmentId: string): Observable<void> {
    const deleteEndpoint = `/api/v1/incidents/${incidentId}/attachments/${attachmentId}`;
    return this.http.delete<void>(deleteEndpoint).pipe(
      tap(() => {
        // Update the local incident by removing the attachment
        const incidents = this.incidentsSubject.getValue();
        const incident = incidents.find(i => i.id === incidentId);
        if (incident && incident.attachments) {
          incident.attachments = incident.attachments.filter(a => a.id !== attachmentId);
          this.incidentsSubject.next([...incidents]);
        }
      }),
      catchError(error => {
        console.error(`Error deleting attachment ${attachmentId}:`, error);
        return of(undefined);
      })
    );
  }
}
