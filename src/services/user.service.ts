import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, CreateUserRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  private mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@company.com',
      name: 'Admin User',
      role: 'admin',
      primaryDepartment: 'IT',
      additionalDepartments: ['Security', 'Administration'],
      isActive: true,
      isSupervisor: true,
      createdAt: new Date('2024-01-01T00:00:00'),
      updatedAt: new Date('2024-01-01T00:00:00')
    },
    {
      id: '2',
      email: 'john.smith@company.com',
      name: 'John Smith',
      role: 'supervisor',
      primaryDepartment: 'IT',
      additionalDepartments: [],
      isActive: true,
      isSupervisor: true,
      createdAt: new Date('2024-01-02T00:00:00'),
      updatedAt: new Date('2024-01-02T00:00:00')
    },
    {
      id: '3',
      email: 'jane.doe@company.com',
      name: 'Jane Doe',
      role: 'user',
      primaryDepartment: 'Security',
      additionalDepartments: ['IT'],
      isActive: true,
      isSupervisor: false,
      createdAt: new Date('2024-01-03T00:00:00'),
      updatedAt: new Date('2024-01-03T00:00:00')
    },
    {
      id: '4',
      email: 'bob.johnson@company.com',
      name: 'Bob Johnson',
      role: 'user',
      primaryDepartment: 'Administration',
      additionalDepartments: [],
      isActive: true,
      isSupervisor: false,
      createdAt: new Date('2024-01-04T00:00:00'),
      updatedAt: new Date('2024-01-04T00:00:00')
    },
    {
      id: '5',
      email: 'sarah.wilson@company.com',
      name: 'Sarah Wilson',
      role: 'user',
      primaryDepartment: 'HR',
      additionalDepartments: ['Administration'],
      isActive: false,
      isSupervisor: false,
      createdAt: new Date('2024-01-05T00:00:00'),
      updatedAt: new Date('2024-01-15T00:00:00')
    }
  ];

  constructor() {
    this.usersSubject.next(this.mockUsers);
  }

  getUsers(): Observable<User[]> {
    return this.users$;
  }

  getUserById(id: string): Observable<User | undefined> {
    const user = this.mockUsers.find(u => u.id === id);
    return of(user);
  }

  createUser(request: CreateUserRequest): Observable<User> {
    const newUser: User = {
      id: Date.now().toString(),
      email: request.email,
      name: request.name,
      role: request.role,
      primaryDepartment: request.primaryDepartment,
      additionalDepartments: request.additionalDepartments,
      isActive: true,
      isSupervisor: request.isSupervisor,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockUsers.push(newUser);
    this.usersSubject.next([...this.mockUsers]);
    
    return of(newUser);
  }

  updateUser(id: string, updates: Partial<User>): Observable<User> {
    const index = this.mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      this.mockUsers[index] = {
        ...this.mockUsers[index],
        ...updates,
        updatedAt: new Date()
      };
      this.usersSubject.next([...this.mockUsers]);
      return of(this.mockUsers[index]);
    }
    throw new Error('User not found');
  }

  deleteUser(id: string): Observable<void> {
    const index = this.mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      this.mockUsers.splice(index, 1);
      this.usersSubject.next([...this.mockUsers]);
    }
    return of();
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