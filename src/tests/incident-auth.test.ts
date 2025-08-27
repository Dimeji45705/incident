import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { IncidentService } from '../services/incident.service';
import { environment } from '../environments/environment';
import { ApiAuthResponse } from '../models/auth.model';
import { Incident } from '../models/incident.model';

describe('Incident Authentication Tests', () => {
  let authService: AuthService;
  let tokenStorage: TokenStorageService;
  let incidentService: IncidentService;
  let httpMock: HttpTestingController;

  const mockUser = {
    id: '1',
    email: 'supervisor@example.com',
    name: 'Test Supervisor',
    role: 'SUPERVISOR',
    primaryDepartment: 'IT',
    additionalDepartments: [],
    active: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };

  const mockAuthResponse: ApiAuthResponse = {
    accessToken: 'test-token',
    tokenType: 'Bearer',
    expiresIn: 3600000,
    user: mockUser
  };

  const mockIncident: Incident = {
      id: '123',
      number: 'INC-123',
      title: 'Test Incident',
      description: 'Test description',
      status: 'INVESTIGATING',
      severity: 'HIGH',
      category: 'TECHNICAL_FAILURE',
      reporterName: 'John Doe',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      incidentDate: '2023-01-01T00:00:00Z',
      detectedAt: '2023-01-01T00:00:00Z',
      comments: [],
      riskLevel: 'MEDIUM',
      involvedSystems: 'System A, System B',
      department: '',
      attachments: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        TokenStorageService,
        IncidentService
      ]
    });

    authService = TestBed.inject(AuthService);
    tokenStorage = TestBed.inject(TokenStorageService);
    incidentService = TestBed.inject(IncidentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should authenticate user and then successfully edit incident with token', () => {
    // First login
    authService.login({ email: 'supervisor@example.com', password: 'password123' }).subscribe(response => {
      expect(response.token).toBe('test-token');
      expect(response.user.role).toBe('supervisor');
      expect(response.user.isSupervisor).toBeTrue();

      // After login, attempt to update an incident
      const updateData = { title: 'Updated Title', description: 'Updated description' };
      incidentService.updateIncident('123', updateData).subscribe(updatedIncident => {
        expect(updatedIncident).toBeTruthy();
        expect(updatedIncident.title).toBe('Updated Title');
      });
    });

    // Expect a login request
    const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(loginReq.request.method).toBe('POST');
    loginReq.flush(mockAuthResponse);

    // Expect an update incident request with the auth token
    const updateReq = httpMock.expectOne(`${environment.apiUrl}/incidents/123`);
    expect(updateReq.request.method).toBe('PUT');
    expect(updateReq.request.headers.has('Authorization')).toBeTrue();
    expect(updateReq.request.headers.get('Authorization')).toBe('Bearer test-token');
    
    // Respond with the updated incident
    const updatedIncident = { ...mockIncident, title: 'Updated Title', description: 'Updated description' };
    updateReq.flush(updatedIncident);
  });

  it('should not allow editing if user is not authenticated', () => {
    // Ensure user is not logged in
    authService.logout();
    
    // Attempt to update an incident
    const updateData = { title: 'Updated Title' };
    incidentService.updateIncident('123', updateData).subscribe({
      next: () => fail('Expected the request to fail'),
      error: error => {
        expect(error).toBeTruthy();
      }
    });

    // Expect an update incident request without auth token to fail
    const updateReq = httpMock.expectOne(`${environment.apiUrl}/incidents/123`);
    expect(updateReq.request.method).toBe('PUT');
    expect(updateReq.request.headers.has('Authorization')).toBeFalse();
    
    // Simulate a 401 unauthorized response
    updateReq.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });
  
  it('should not allow editing if user does not have supervisor role', () => {
    // Mock a regular user login
    const regularUserResponse: ApiAuthResponse = {
      ...mockAuthResponse,
      user: {
        ...mockUser,
        role: 'USER'
      }
    };
    
    // Login as a regular user
    authService.login({ email: 'user@example.com', password: 'password123' }).subscribe(response => {
      expect(response.user.role).toBe('user');
      expect(response.user.isSupervisor).toBeFalse();
      
      // Check if canEditIncident would return false
      expect(authService.isSupervisor()).toBeFalse();
    });
    
    // Expect a login request
    const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(loginReq.request.method).toBe('POST');
    loginReq.flush(regularUserResponse);
  });
});
