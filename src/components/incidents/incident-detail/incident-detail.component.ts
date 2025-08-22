import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IncidentService } from '../../../services/incident.service';
import { AuthService } from '../../../services/auth.service';
import { Incident, CreateCommentRequest } from '../../../models/incident.model';

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

  updateStatus(status: string): void {
    if (this.incident) {
      this.incidentService.updateIncident(this.incident.id, { status: status as any }).subscribe();
    }
  }

  addComment(): void {
    if (this.incident && this.newComment.content.trim()) {
      this.incidentService.addComment(this.incident.id, this.newComment).subscribe(() => {
        this.newComment.content = '';
      });
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Handle file upload logic here
      console.log('Files selected:', files);
    }
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