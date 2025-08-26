export interface Incident {
  id: string;
  number: string;
  title: string;
  description: string;
  category?: 'TECHNICAL_FAILURE' | 'HUMAN_ERROR' | 'EXTERNAL_FACTOR' | 'SECURITY_BREACH' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  financialImpact?: number;
  affectedTransactions?: string;
  customerImpactCount?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  complianceFlag?: boolean;
  involvedSystems?: string;
  incidentDate?: string;
  detectedAt?: string;
  resolvedAt?: string;
  resolutionDetails?: string;
  department: string;
  reporterId?: string;
  reporterName?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  comments: IncidentComment[];
  attachments: IncidentAttachment[];
}

export interface IncidentComment {
  id: string;
  content: string;
  userName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentAttachment {
  id: string;
  incidentId: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  contentType: string;
  fileUrl: string;
  publicId?: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  category?: 'TECHNICAL_FAILURE' | 'HUMAN_ERROR' | 'EXTERNAL_FACTOR' | 'SECURITY_BREACH' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  financialImpact?: number;
  affectedTransactions?: string;
  customerImpactCount?: number;
  complianceFlag?: boolean;
  involvedSystems?: string;
  incidentDate?: string;
  department: string;
}

export interface UpdateIncidentRequest {
  title?: string;
  description?: string;
  status?: 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category?: 'TECHNICAL_FAILURE' | 'HUMAN_ERROR' | 'EXTERNAL_FACTOR' | 'SECURITY_BREACH' | 'OTHER';
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  financialImpact?: number;
  affectedTransactions?: string;
  customerImpactCount?: number;
  complianceFlag?: boolean;
  involvedSystems?: string;
  department?: string;
  resolutionDetails?: string;
}

export interface CreateCommentRequest {
  content: string;
}