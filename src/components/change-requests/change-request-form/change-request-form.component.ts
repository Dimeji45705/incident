import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeRequestService } from '../../../services/change-request.service';
import { UserService } from '../../../services/user.service';
import { CreateChangeRequestRequest, ChangeRequest } from '../../../models/change-request.model';

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
    department: '',
    justification: '',
    impact: '',
    rollbackPlan: ''
  };
  
  departments: string[] = [];
  isSubmitting = false;
  isEdit = false;
  changeRequestId: string | null = null;

  constructor(
    private changeRequestService: ChangeRequestService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userService.getDepartments().subscribe(departments => {
      this.departments = departments;
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
            department: cr.department,
            justification: cr.justification,
            impact: cr.impact,
            rollbackPlan: cr.rollbackPlan
          };
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.changeRequest.title || !this.changeRequest.description || 
        !this.changeRequest.department || !this.changeRequest.justification ||
        !this.changeRequest.impact || !this.changeRequest.rollbackPlan) {
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
          console.error('Failed to update change request:', error);
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
          console.error('Failed to create change request:', error);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/change-requests']);
  }
}