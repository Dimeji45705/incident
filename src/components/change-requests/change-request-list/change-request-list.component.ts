import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeRequestService } from '../../../services/change-request.service';
import { ChangeRequest } from '../../../models/change-request.model';

@Component({
  selector: 'app-change-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './change-request-list.component.html',
  styleUrls: ['./change-request-list.component.scss']
})
export class ChangeRequestListComponent implements OnInit {
  changeRequests: ChangeRequest[] = [];

  constructor(private changeRequestService: ChangeRequestService) {}

  ngOnInit(): void {
    this.changeRequestService.getChangeRequests().subscribe(changeRequests => {
      this.changeRequests = changeRequests;
    });
  }

  viewChangeRequest(id: string): void {
    // Navigation handled by routerLink in template
  }
}