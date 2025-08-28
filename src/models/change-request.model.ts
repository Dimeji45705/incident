export interface ChangeRequest {
  id: string;
  number: string;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED';
  incidentId: string;
  assignedDepartment: string;
  createdBy: string;
  approvedBy?: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  completedAt?: string;
  notes?: string;
}

// API Response interfaces
export interface ApiChangeRequest {
  id: string;
  number: string;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED';
  incidentId: string;
  assignedDepartment: string;
  createdBy: string;
  approvedBy?: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface ChangeRequestPageResponse {
  content: ApiChangeRequest[];
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

export interface CreateChangeRequestRequest {
  title: string;
  description: string;
  incidentId: string;
  assignedDepartment: string;
  notes?: string;
}

export interface UpdateChangeRequestRequest {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED';
  incidentId?: string;
  assignedDepartment?: string;
  notes?: string;
}

export interface ChangeRequestFilter {
  status?: string;
  assignedDepartment?: string;
  incidentId?: string;
  createdBy?: string;
  searchTerm?: string;
}