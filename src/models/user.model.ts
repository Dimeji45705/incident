export interface User {
  id: string;
  email: string;
  name: string;
  primaryDepartment: string;
  additionalDepartments: string[];
  role: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  primaryDepartment: string;
  additionalDepartments: string[];
  role: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE';
}

export interface UpdateUserRequest {
  name?: string;
  primaryDepartment?: string;
  additionalDepartments?: string[];
  role?: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE';
  active?: boolean;
}

export interface UserPageResponse {
  content: User[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface UserFilter {
  role?: string;
  primaryDepartment?: string;
  active?: boolean;
  searchTerm?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}