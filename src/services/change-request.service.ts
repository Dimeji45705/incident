import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ChangeRequest, CreateChangeRequestRequest, UpdateChangeRequestRequest } from '../models/change-request.model';

@Injectable({
  providedIn: 'root'
})
export class ChangeRequestService {
  private changeRequestsSubject = new BehaviorSubject<ChangeRequest[]>([]);
  public changeRequests$ = this.changeRequestsSubject.asObservable();

  private mockChangeRequests: ChangeRequest[] = [
    {
      id: '1',
      number: 'CR-001',
      title: 'Upgrade database server',
      description: 'Upgrade the main database server to the latest version for improved performance and security',
      status: 'pending',
      department: 'IT',
      createdBy: 'user1',
      createdByName: 'John Smith',
      createdAt: new Date('2024-01-15T09:00:00'),
      updatedAt: new Date('2024-01-15T09:00:00'),
      justification: 'Current version has known security vulnerabilities and performance issues',
      impact: 'System will be offline for 2-3 hours during upgrade window',
      rollbackPlan: 'Database backup will be taken before upgrade. Can restore from backup if issues occur'
    },
    {
      id: '2',
      number: 'CR-002',
      title: 'Install new firewall rules',
      description: 'Add new firewall rules to block suspicious traffic patterns',
      status: 'approved',
      department: 'Security',
      createdBy: 'user2',
      createdByName: 'Jane Doe',
      approvedBy: 'admin1',
      approvedByName: 'Admin User',
      createdAt: new Date('2024-01-14T14:30:00'),
      updatedAt: new Date('2024-01-15T08:45:00'),
      approvedAt: new Date('2024-01-15T08:45:00'),
      justification: 'Recent security audit identified potential vulnerabilities',
      impact: 'No downtime expected, rules will be applied during maintenance window',
      rollbackPlan: 'Previous firewall configuration backed up and can be restored immediately'
    },
    {
      id: '3',
      number: 'CR-003',
      title: 'Update office software licenses',
      description: 'Renew and update office software licenses for all departments',
      status: 'completed',
      department: 'Administration',
      createdBy: 'user3',
      createdByName: 'Bob Johnson',
      approvedBy: 'admin1',
      approvedByName: 'Admin User',
      createdAt: new Date('2024-01-10T10:15:00'),
      updatedAt: new Date('2024-01-13T16:20:00'),
      approvedAt: new Date('2024-01-11T09:30:00'),
      completedAt: new Date('2024-01-13T16:20:00'),
      justification: 'Current licenses expire at end of month',
      impact: 'Users may experience brief interruption during license activation',
      rollbackPlan: 'Previous license keys documented and can be reactivated if needed'
    }
  ];

  constructor() {
    this.changeRequestsSubject.next(this.mockChangeRequests);
  }

  getChangeRequests(): Observable<ChangeRequest[]> {
    return this.changeRequests$;
  }

  getChangeRequestById(id: string): Observable<ChangeRequest | undefined> {
    const changeRequest = this.mockChangeRequests.find(cr => cr.id === id);
    return of(changeRequest);
  }

  createChangeRequest(request: CreateChangeRequestRequest): Observable<ChangeRequest> {
    const newChangeRequest: ChangeRequest = {
      id: Date.now().toString(),
      number: `CR-${String(this.mockChangeRequests.length + 1).padStart(3, '0')}`,
      title: request.title,
      description: request.description,
      status: 'pending',
      department: request.department,
      createdBy: 'current-user',
      createdByName: 'Current User',
      createdAt: new Date(),
      updatedAt: new Date(),
      justification: request.justification,
      impact: request.impact,
      rollbackPlan: request.rollbackPlan
    };

    this.mockChangeRequests.unshift(newChangeRequest);
    this.changeRequestsSubject.next([...this.mockChangeRequests]);
    
    return of(newChangeRequest);
  }

  updateChangeRequest(id: string, request: UpdateChangeRequestRequest): Observable<ChangeRequest> {
    const index = this.mockChangeRequests.findIndex(cr => cr.id === id);
    if (index !== -1) {
      this.mockChangeRequests[index] = {
        ...this.mockChangeRequests[index],
        ...request,
        updatedAt: new Date(),
        approvedAt: request.status === 'approved' ? new Date() : this.mockChangeRequests[index].approvedAt,
        completedAt: request.status === 'completed' ? new Date() : this.mockChangeRequests[index].completedAt
      };
      this.changeRequestsSubject.next([...this.mockChangeRequests]);
      return of(this.mockChangeRequests[index]);
    }
    throw new Error('Change request not found');
  }

  approveChangeRequest(id: string): Observable<ChangeRequest> {
    return this.updateChangeRequest(id, { 
      status: 'approved',
    });
  }

  rejectChangeRequest(id: string): Observable<ChangeRequest> {
    return this.updateChangeRequest(id, { status: 'rejected' });
  }

  completeChangeRequest(id: string): Observable<ChangeRequest> {
    return this.updateChangeRequest(id, { status: 'completed' });
  }

  deleteChangeRequest(id: string): Observable<void> {
    const index = this.mockChangeRequests.findIndex(cr => cr.id === id);
    if (index !== -1) {
      this.mockChangeRequests.splice(index, 1);
      this.changeRequestsSubject.next([...this.mockChangeRequests]);
    }
    return of();
  }
}