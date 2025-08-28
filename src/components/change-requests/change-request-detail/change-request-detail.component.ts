import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ChangeRequestService } from '../../../services/change-request.service';
import { AuthService } from '../../../services/auth.service';
import { ChangeRequest } from '../../../models/change-request.model';

@Component({
  selector: 'app-change-request-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './change-request-detail.component.html',
  styleUrls: ['./change-request-detail.component.scss']
})
export class ChangeRequestDetailComponent implements OnInit {
  changeRequest: ChangeRequest | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private changeRequestService: ChangeRequestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.changeRequestService.getChangeRequestById(id).subscribe(cr => {
        this.changeRequest = cr || null;
      });
    }
  }

  get canEdit(): boolean {
    return this.changeRequest?.status === 'PENDING' && this.authService.isSupervisor();
  }

  get canApprove(): boolean {
    return this.changeRequest?.status === 'PENDING' && this.authService.isSupervisor();
  }


  get canComplete(): boolean {
    return this.changeRequest?.status === 'APPROVED' && this.authService.isSupervisor();
  }

  approveChangeRequest(): void {
    if (this.changeRequest) {
      const approvalNotes = prompt('Enter approval notes:', 'Approved for implementation - low risk change');
      if (approvalNotes !== null) {
        this.changeRequestService.approveChangeRequest(this.changeRequest.id, approvalNotes).subscribe({
          next: (updatedCr) => {
            this.changeRequest = updatedCr;
            alert('Change request approved successfully!');
          },
          error: (error) => {
            alert(`Failed to approve change request: ${error.message}`);
          }
        });
      }
    }
  }


  completeChangeRequest(): void {
    if (this.changeRequest) {
      const completionNotes = prompt('Enter completion notes:', 'Change request completed successfully');
      if (completionNotes !== null) {
        this.changeRequestService.completeChangeRequest(this.changeRequest.id, completionNotes).subscribe({
          next: (updatedCr) => {
            this.changeRequest = updatedCr;
            alert('Change request marked as completed!');
          },
          error: (error) => {
            alert(`Failed to complete change request: ${error.message}`);
          }
        });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/change-requests']);
  }
}