export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'user' | 'EMPLOYEE';
  primaryDepartment: string;
  additionalDepartments: string[];
  isActive: boolean;
  isSupervisor: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  primaryDepartment: string;
  additionalDepartments: string[];
  role: 'admin' | 'supervisor' | 'user' | 'EMPLOYEE';
  isSupervisor: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}