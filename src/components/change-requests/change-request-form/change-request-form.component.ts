import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeRequestService } from '../../../services/change-request.service';
import { UserService } from '../../../services/user.service';
import { IncidentService } from '../../../services/incident.service';
import { CreateChangeRequestRequest, ChangeRequest } from '../../../models/change-request.model';
import { Incident } from '../../../models/incident.model';

@Component({
  selector: 'app-change-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-request-form.component.html',
  styleUrls: ['./change-request-form.component.scss']
})
export class ChangeRequestFormComponent implements OnInit {
  changeRequest: CreateChangeRequestRequest = {
    title: '',
    description: '',
    incidentId: '',
    assignedDepartment: '',
    notes: ''
  };
  
  departments: string[] = [];
  resolvedIncidents: Incident[] = [];
  isSubmitting = false;
  isEdit = false;
  changeRequestId: string | null = null;

  constructor(
    private changeRequestService: ChangeRequestService,
    private userService: UserService,
    private incidentService: IncidentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Load departments
    this.userService.getDepartments().subscribe(departments => {
      this.departments = departments;
    });

    // Load resolved incidents for dropdown
    this.incidentService.getResolvedIncidents().subscribe(incidents => {
      this.resolvedIncidents = incidents;
    });

    // Check if this is an edit operation
    this.changeRequestId = this.route.snapshot.paramMap.get('id');
    if (this.changeRequestId) {
      this.isEdit = true;
      this.loadChangeRequest();
    }
  }

  loadChangeRequest(): void {
    if (this.changeRequestId) {
      this.changeRequestService.getChangeRequestById(this.changeRequestId).subscribe(cr => {
        if (cr) {
          this.changeRequest = {
            title: cr.title,
            description: cr.description,
            incidentId: cr.incidentId,
            assignedDepartment: cr.assignedDepartment,
            notes: cr.notes || ''
          };
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.changeRequest.title || !this.changeRequest.description || 
        !this.changeRequest.incidentId || !this.changeRequest.assignedDepartment) {
      return;
    }

    this.isSubmitting = true;
    
    if (this.isEdit && this.changeRequestId) {
      this.changeRequestService.updateChangeRequest(this.changeRequestId, this.changeRequest).subscribe({
        next: (cr) => {
          this.isSubmitting = false;
          this.router.navigate(['/change-requests', cr.id]);
        },
        error: (error) => {
          this.isSubmitting = false;
          alert(`Failed to update change request: ${error.message}`);
        }
      });
    } else {
      this.changeRequestService.createChangeRequest(this.changeRequest).subscribe({
        next: (cr) => {
          this.isSubmitting = false;
          this.router.navigate(['/change-requests', cr.id]);
        },
        error: (error) => {
          this.isSubmitting = false;
          alert(`Failed to create change request: ${error.message}`);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/change-requests']);
  }
}