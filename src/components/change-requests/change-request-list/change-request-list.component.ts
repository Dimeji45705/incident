import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChangeRequestService } from '../../../services/change-request.service';
import { ChangeRequest, ChangeRequestFilter } from '../../../models/change-request.model';

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
  
  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 20;
  totalElements: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;
  
  // Filter properties
  currentFilter: ChangeRequestFilter = {};

  constructor(
    private changeRequestService: ChangeRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadChangeRequests();
  }
  
  loadChangeRequests(): void {
    this.isLoading = true;
    
    console.log('Loading change requests with filter:', this.currentFilter);
    
    this.changeRequestService.getChangeRequests(
      this.currentPage,
      this.pageSize,
      'createdAt',
      'desc',
      this.currentFilter
    ).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.changeRequests = response.content.map(cr => ({
          ...cr,
          createdAt: cr.createdAt,
          updatedAt: cr.updatedAt,
          approvedAt: cr.approvedAt,
          completedAt: cr.completedAt
        }));
        
        // Apply client-side filtering if needed
        this.applyClientSideFilters();
        
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading change requests:', error);
        this.isLoading = false;
      }
    });
  }
  
  // Apply client-side filters (backup for API filtering)
  private applyClientSideFilters(): void {
    let filtered = this.changeRequests;
    
    // Filter by status if active tab is not 'all'
    if (this.activeTab !== 'all' && this.currentFilter.status) {
      filtered = filtered.filter(cr => 
        cr.status?.toUpperCase() === this.currentFilter.status?.toUpperCase()
      );
    }
    
    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(cr =>
        cr.number?.toLowerCase().includes(searchLower) ||
        cr.title?.toLowerCase().includes(searchLower) ||
        cr.assignedDepartment?.toLowerCase().includes(searchLower) ||
        cr.createdBy?.toLowerCase().includes(searchLower)
      );
    }
    
    this.filteredChangeRequests = filtered;
    console.log(`Filtered ${filtered.length} items for tab '${this.activeTab}'`);
  }

  // Tab Management
  onTabChange(tab: string): void {
    console.log(`Tab changed to: ${tab}`);
    this.activeTab = tab;
    this.currentPage = 0; // Reset to first page
    
    // Update filter based on tab
    if (tab === 'all') {
      delete this.currentFilter.status;
      console.log('Removed status filter for "all" tab');
    } else {
      // Map tab values to API status values
      const statusMap: { [key: string]: string } = {
        'pending': 'PENDING',
        'approved': 'APPROVED', 
        'completed': 'COMPLETED'
      };
      this.currentFilter.status = statusMap[tab] || tab.toUpperCase();
      console.log(`Set status filter to: ${this.currentFilter.status} for tab: ${tab}`);
    }
    
    this.loadChangeRequests();
  }

  // Search Functionality  
  onSearch(): void {
    this.currentPage = 0; // Reset to first page
    // Update filter with search term
    if (this.searchTerm.trim()) {
      this.currentFilter.searchTerm = this.searchTerm.trim();
    } else {
      delete this.currentFilter.searchTerm;
    }
    this.loadChangeRequests();
  }


  // Pagination Methods
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadChangeRequests();
    }
  }
  
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadChangeRequests();
    }
  }
  
  setPageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0;
    this.loadChangeRequests();
  }
  
  // Status Count Methods  
  getTotalCount(): number {
    return this.totalElements;
  }

  getStatusCount(status: string): number {
    if (!this.changeRequests || this.changeRequests.length === 0) {
      return 0;
    }
    
    const statusMap: { [key: string]: string } = {
      'pending': 'PENDING',
      'approved': 'APPROVED', 
      'completed': 'COMPLETED'
    };
    
    const targetStatus = statusMap[status] || status.toUpperCase();
    
    return this.changeRequests.filter(cr => 
      cr.status?.toUpperCase() === targetStatus
    ).length;
  }

  // Status Class for Pills
  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }
  
  // Format status for display
  getStatusDisplay(status: string): string {
    switch(status?.toUpperCase()) {
      case 'PENDING': return 'PENDING';
      case 'APPROVED': return 'APPROVED';
      case 'REJECTED': return 'REJECTED';
      case 'IN_PROGRESS': return 'IN PROGRESS';
      case 'COMPLETED': return 'COMPLETED';
      default: return status?.toUpperCase() || '';
    }
  }
  
  // Format date for display
  formatDate(dateString: string): Date {
    return new Date(dateString);
  }

  // Navigation Methods
  viewChangeRequest(id: string): void {
    this.router.navigate(['/change-requests', id]);
  }

  createChangeRequest(): void {
    this.router.navigate(['/change-requests/create']);
  }
}