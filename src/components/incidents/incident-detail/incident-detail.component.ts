import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IncidentService } from '../../../services/incident.service';
import { AuthService } from '../../../services/auth.service';
import { Incident, CreateCommentRequest, IncidentAttachment, UpdateIncidentRequest } from '../../../models/incident.model';

@Component({
  selector: 'app-incident-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './incident-detail.component.html',
  styleUrls: ['./incident-detail.component.scss']
})
export class IncidentDetailComponent implements OnInit {
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private incidentService: IncidentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.incidentService.getIncidentById(id).subscribe(incident => {
        this.incident = incident || null;
      });
    }
  }

  get canUpdateStatus(): boolean {
    return this.authService.isSupervisor();
  }
  
  get canEditIncident(): boolean {
    return this.authService.isSupervisor();
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