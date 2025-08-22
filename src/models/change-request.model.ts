export interface ChangeRequest {
  id: string;
  number: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed';
  department: string;
  createdBy: string;
  createdByName: string;
  approvedBy?: string;
  approvedByName?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  justification: string;
  impact: string;
  rollbackPlan: string;
}

export interface CreateChangeRequestRequest {
  title: string;
  description: string;
  department: string;
  justification: string;
  impact: string;
  rollbackPlan: string;
}

export interface UpdateChangeRequestRequest {
  title?: string;
  description?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed';
  justification?: string;
  impact?: string;
  rollbackPlan?: string;
}