import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IncidentService } from '../../../services/incident.service';
import { AuthService } from '../../../services/auth.service';
import { IncidentEditorService } from '../../../services/incident-editor.service';
import { Incident, CreateCommentRequest, IncidentAttachment, UpdateIncidentRequest } from '../../../models/incident.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-incident-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './incident-detail.component.html',
  styleUrls: ['./incident-detail.component.scss']
})
export class IncidentDetailComponent implements OnInit, OnDestroy {
  incident: Incident | null = null;
  newComment: CreateCommentRequest = { content: '' };
  uploadingAttachment = false;
  attachmentDescription = '';
  selectedFile: File | null = null;
  uploadProgress = 0;
  uploadError = '';
  
  // Edit mode properties
  editMode = false;
  incidentForm: UpdateIncidentRequest = {};
  saving = false;
  saveError = '';
  
  // Subscription for the editor service
  private editorSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private incidentService: IncidentService,
    public authService: AuthService, // Changed to public so template can access it
    private incidentEditorService: IncidentEditorService
  ) {}

  ngOnInit(): void {
    // DEBUG: Log authentication status and role information
    console.log('Auth Status:', {
      isAuthenticated: this.authService.isAuthenticated(),
      isSupervisor: this.authService.isSupervisor(),
      currentUser: this.authService.getCurrentUser(),
      canEditIncident: this.canEditIncident
    });
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // First get the incident data
      this.incidentService.getIncidentById(id).subscribe(incident => {
        this.incident = incident || null;
        
        // DEBUG: Log incident and edit permissions
        console.log('Incident loaded:', {
          incident: this.incident,
          canEditIncident: this.canEditIncident,
          editMode: this.editMode
        });
        
        // Check for edit mode from query params (legacy support)
        const editParam = this.route.snapshot.queryParamMap.get('edit');
        if (editParam === 'true' && this.incident && this.canEditIncident) {
          this.enableEditMode();
        }
        
        // Subscribe to the editor service to detect edit mode changes
        this.editorSubscription = this.incidentEditorService.editMode$.subscribe(editIncidentId => {
          // If this incident is the one being edited and user has permission
          if (editIncidentId === id && this.incident && this.canEditIncident) {
            this.enableEditMode();
          }
        });
        
        // Check if this incident is already in edit mode
        if (this.incidentEditorService.isInEditMode(id) && this.canEditIncident) {
          this.enableEditMode();
        }
      });
    }
  }
  
  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.editorSubscription) {
      this.editorSubscription.unsubscribe();
      this.editorSubscription = null;
    }
    
    // If we're leaving the component and in edit mode, clear the edit mode state
    if (this.incident && this.editMode) {
      this.incidentEditorService.deactivateEditMode();
    }
  }

  get canUpdateStatus(): boolean {
    // Make sure user is authenticated AND has supervisor/admin role
    return this.authService.isAuthenticated() && this.authService.isSupervisor();
  }
  
  get canEditIncident(): boolean {
    // Make sure user is authenticated AND has supervisor/admin role
    const isAuth = this.authService.isAuthenticated();
    const isAdmin = this.authService.isAdmin();
    const isSupervisor = this.authService.isSupervisor();
    const canEdit = isAuth && (isAdmin || isSupervisor);
    
    console.log('DEBUG - canEditIncident check:', {
      isAuthenticated: isAuth,
      isAdmin: isAdmin,
      isSupervisor: isSupervisor,
      canEdit: canEdit,
      currentUser: this.authService.getCurrentUser()
    });
    
    return canEdit;
  }

  updateStatus(status: string): void {
    if (this.incident) {
      this.incidentService.updateIncident(this.incident.id, { status: status as any }).subscribe({
        next: (updatedIncident) => {
          if (updatedIncident) {
            this.incident = updatedIncident;
          }
        },
        error: (error) => {
          console.error('Error updating status:', error);
          alert('Failed to update status. Please try again.');
        }
      });
    }
  }
  
  enableEditMode(): void {
    if (!this.incident) return;
    
    // Create a copy of the incident for editing
    this.incidentForm = {
      title: this.incident.title,
      description: this.incident.description,
      severity: this.incident.severity,
      status: this.incident.status,
      category: this.incident.category,
      riskLevel: this.incident.riskLevel,
      financialImpact: this.incident.financialImpact,
      affectedTransactions: this.incident.affectedTransactions,
      customerImpactCount: this.incident.customerImpactCount,
      complianceFlag: this.incident.complianceFlag,
      involvedSystems: this.incident.involvedSystems,
      department: this.incident.department,
      resolutionDetails: this.incident.resolutionDetails
    };
    
    this.editMode = true;
  }
  
  cancelEdit(): void {
    if (this.saving) return;
    
    this.editMode = false;
    this.incidentForm = {};
    this.saveError = '';
  }
  
  saveIncident(): void {
    if (!this.incident || !this.editMode) return;
    
    this.saving = true;
    this.saveError = '';
    
    this.incidentService.updateIncident(this.incident.id, this.incidentForm).subscribe({
      next: (updatedIncident) => {
        this.saving = false;
        if (updatedIncident) {
          this.incident = updatedIncident;
          this.editMode = false;
        }
      },
      error: (error) => {
        this.saving = false;
        this.saveError = 'Failed to update incident. Please check the form and try again.';
        console.error('Error updating incident:', error);
      }
    });
  }

  addComment(): void {
    if (this.incident && this.newComment.content.trim()) {
      // Use the specific incident ID for the comments endpoint
      const incidentId = this.incident.id;
      
      this.incidentService.addComment(incidentId, this.newComment).subscribe({
        next: (comment) => {
          console.log('Comment added successfully:', comment);
          // Clear the comment input field
          this.newComment.content = '';
          
          // Make sure incident is still defined (typescript safety check)
          if (this.incident) {
            // If the incident doesn't have a comments array, create one
            if (!this.incident.comments) {
              this.incident.comments = [];
            }
            
            // Add the new comment to the incident
            if (comment) {
              this.incident.comments.push(comment);
            } else {
              // If the comment is null, create a placeholder
              const placeholderComment = {
                id: Date.now().toString(),
                content: this.newComment.content.trim(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                userName: 'Me'
              };
              this.incident.comments.push(placeholderComment);
            }
          }
        },
        error: (error) => {
          console.error('Error adding comment:', error);
          alert('Failed to add comment. Please try again.');
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      // Clear any previous error
      this.uploadError = '';
    }
  }
  
  uploadAttachment(): void {
    if (!this.incident || !this.selectedFile) {
      return;
    }
    
    this.uploadingAttachment = true;
    this.uploadProgress = 10;
    
    this.incidentService.uploadAttachment(
      this.incident.id, 
      this.selectedFile, 
      this.attachmentDescription
    ).subscribe({
      next: (attachment) => {
        this.uploadingAttachment = false;
        this.uploadProgress = 100;
        this.selectedFile = null;
        this.attachmentDescription = '';
        
        if (this.incident && attachment) {
          if (!this.incident.attachments) {
            this.incident.attachments = [];
          }
          this.incident.attachments.push(attachment);
        }
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      },
      error: (error) => {
        this.uploadingAttachment = false;
        this.uploadProgress = 0;
        this.uploadError = 'Failed to upload attachment. Please try again.';
        console.error('Error uploading attachment:', error);
      }
    });
  }
  
  downloadAttachment(attachment: IncidentAttachment): void {
    if (!this.incident) return;
    
    this.incidentService.downloadAttachment(this.incident.id, attachment.id)
      .subscribe({
        next: (blob) => {
          // Create a download link and trigger it
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = attachment.originalFileName || attachment.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error downloading attachment:', error);
          alert('Failed to download attachment. Please try again.');
        }
      });
  }
  
  deleteAttachment(attachment: IncidentAttachment): void {
    if (!this.incident || !confirm('Are you sure you want to delete this attachment?')) {
      return;
    }
    
    this.incidentService.deleteAttachment(this.incident.id, attachment.id)
      .subscribe({
        next: () => {
          if (this.incident && this.incident.attachments) {
            this.incident.attachments = this.incident.attachments.filter(a => a.id !== attachment.id);
          }
        },
        error: (error) => {
          console.error('Error deleting attachment:', error);
          alert('Failed to delete attachment. Please try again.');
        }
      });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  goBack(): void {
    this.router.navigate(['/incidents']);
  }
}