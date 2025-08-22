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
    return this.changeRequest?.status === 'pending' && this.authService.isSupervisor();
  }

  get canApprove(): boolean {
    return this.changeRequest?.status === 'pending' && this.authService.isSupervisor();
  }

  get canReject(): boolean {
    return this.changeRequest?.status === 'pending' && this.authService.isSupervisor();
  }

  get canComplete(): boolean {
    return this.changeRequest?.status === 'approved' && this.authService.isSupervisor();
  }

  approveChangeRequest(): void {
    if (this.changeRequest) {
      this.changeRequestService.approveChangeRequest(this.changeRequest.id).subscribe();
    }
  }

  rejectChangeRequest(): void {
    if (this.changeRequest) {
      this.changeRequestService.rejectChangeRequest(this.changeRequest.id).subscribe();
    }
  }

  completeChangeRequest(): void {
    if (this.changeRequest) {
      this.changeRequestService.completeChangeRequest(this.changeRequest.id).subscribe();
    }
  }

  goBack(): void {
    this.router.navigate(['/change-requests']);
  }
}