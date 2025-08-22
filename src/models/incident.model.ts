export interface Incident {
  id: string;
  number: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  department: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  comments: IncidentComment[];
  attachments: IncidentAttachment[];
}

export interface IncidentComment {
  id: string;
  incidentId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface IncidentAttachment {
  id: string;
  incidentId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  department: string;
}

export interface UpdateIncidentRequest {
  title?: string;
  description?: string;
  status?: 'open' | 'in-progress' | 'resolved' | 'closed';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
}

export interface CreateCommentRequest {
  content: string;
}