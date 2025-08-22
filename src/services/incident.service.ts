import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Incident, CreateIncidentRequest, UpdateIncidentRequest, CreateCommentRequest, IncidentComment } from '../models/incident.model';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private incidentsSubject = new BehaviorSubject<Incident[]>([]);
  public incidents$ = this.incidentsSubject.asObservable();

  private mockIncidents: Incident[] = [
    {
      id: '1',
      number: 'INC-001',
      title: 'Email server down',
      description: 'The main email server is not responding to requests',
      status: 'open',
      severity: 'high',
      department: 'IT',
      createdBy: 'user1',
      createdAt: new Date('2024-01-15T10:30:00'),
      updatedAt: new Date('2024-01-15T10:30:00'),
      comments: [],
      attachments: []
    },
    {
      id: '2',
      number: 'INC-002',
      title: 'Network connectivity issues',
      description: 'Users reporting slow internet connection in Building A',
      status: 'in-progress',
      severity: 'medium',
      department: 'IT',
      createdBy: 'user2',
      assignedTo: 'tech1',
      createdAt: new Date('2024-01-14T14:20:00'),
      updatedAt: new Date('2024-01-15T09:15:00'),
      comments: [
        {
          id: '1',
          incidentId: '2',
          userId: 'tech1',
          userName: 'Tech Support',
          content: 'Investigating the network switches in Building A',
          createdAt: new Date('2024-01-15T09:15:00')
        }
      ],
      attachments: []
    },
    {
      id: '3',
      number: 'INC-003',
      title: 'Printer not working',
      description: 'Main office printer showing error code E-001',
      status: 'resolved',
      severity: 'low',
      department: 'Administration',
      createdBy: 'user3',
      assignedTo: 'tech2',
      createdAt: new Date('2024-01-13T11:45:00'),
      updatedAt: new Date('2024-01-14T16:30:00'),
      resolvedAt: new Date('2024-01-14T16:30:00'),
      comments: [],
      attachments: []
    }
  ];

  constructor() {
    this.incidentsSubject.next(this.mockIncidents);
  }

  getIncidents(): Observable<Incident[]> {
    return this.incidents$;
  }

  getIncidentById(id: string): Observable<Incident | undefined> {
    const incident = this.mockIncidents.find(i => i.id === id);
    return of(incident);
  }

  createIncident(request: CreateIncidentRequest): Observable<Incident> {
    const newIncident: Incident = {
      id: Date.now().toString(),
      number: `INC-${String(this.mockIncidents.length + 1).padStart(3, '0')}`,
      title: request.title,
      description: request.description,
      status: 'open',
      severity: request.severity,
      department: request.department,
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
      attachments: []
    };

    this.mockIncidents.unshift(newIncident);
    this.incidentsSubject.next([...this.mockIncidents]);
    
    return of(newIncident);
  }

  updateIncident(id: string, request: UpdateIncidentRequest): Observable<Incident> {
    const index = this.mockIncidents.findIndex(i => i.id === id);
    if (index !== -1) {
      this.mockIncidents[index] = {
        ...this.mockIncidents[index],
        ...request,
        updatedAt: new Date(),
        resolvedAt: request.status === 'resolved' ? new Date() : this.mockIncidents[index].resolvedAt
      };
      this.incidentsSubject.next([...this.mockIncidents]);
      return of(this.mockIncidents[index]);
    }
    throw new Error('Incident not found');
  }

  addComment(incidentId: string, request: CreateCommentRequest): Observable<IncidentComment> {
    const incident = this.mockIncidents.find(i => i.id === incidentId);
    if (incident) {
      const newComment: IncidentComment = {
        id: Date.now().toString(),
        incidentId,
        userId: 'current-user',
        userName: 'Current User',
        content: request.content,
        createdAt: new Date()
      };
      
      incident.comments.push(newComment);
      incident.updatedAt = new Date();
      this.incidentsSubject.next([...this.mockIncidents]);
      
      return of(newComment);
    }
    throw new Error('Incident not found');
  }

  deleteIncident(id: string): Observable<void> {
    const index = this.mockIncidents.findIndex(i => i.id === id);
    if (index !== -1) {
      this.mockIncidents.splice(index, 1);
      this.incidentsSubject.next([...this.mockIncidents]);
    }
    return of();
  }
}