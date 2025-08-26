import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChangeRequestService } from '../../../services/change-request.service';
import { ChangeRequest } from '../../../models/change-request.model';

@Component({
  selector: 'app-change-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './change-request-list.component.html',
  styleUrls: ['./change-request-list.component.scss']
})
export class ChangeRequestListComponent implements OnInit {
  changeRequests: ChangeRequest[] = [];
  filteredChangeRequests: ChangeRequest[] = [];
  searchTerm: string = '';
  activeTab: string = 'all';

  constructor(
    private changeRequestService: ChangeRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.changeRequestService.getChangeRequests().subscribe(changeRequests => {
      this.changeRequests = changeRequests;
      this.filteredChangeRequests = changeRequests;
    });
  }

  // Tab Management
  onTabChange(tab: string): void {
    this.activeTab = tab;
    this.filterChangeRequests();
  }

  // Search Functionality
  onSearch(): void {
    this.filterChangeRequests();
  }

  // Filter change requests based on search term and active tab
  private filterChangeRequests(): void {
    let filtered = this.changeRequests;

    // Filter by tab
    if (this.activeTab !== 'all') {
      filtered = filtered.filter(cr => cr.status.toLowerCase() === this.activeTab);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(cr =>
        cr.number.toLowerCase().includes(searchLower) ||
        cr.title.toLowerCase().includes(searchLower) ||
        cr.department.toLowerCase().includes(searchLower)
      );
    }

    this.filteredChangeRequests = filtered;
  }

  // Status Count Methods
  getTotalCount(): number {
    return this.changeRequests.length;
  }

  getStatusCount(status: string): number {
    return this.changeRequests.filter(cr => cr.status.toLowerCase() === status).length;
  }

  // Status Class for Pills
  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  // Navigation Methods
  viewChangeRequest(id: string): void {
    this.router.navigate(['/change-requests', id]);
  }

  createChangeRequest(): void {
    this.router.navigate(['/change-requests/create']);
  }
}