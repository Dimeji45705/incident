import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IncidentService, IncidentFilter } from '../../../services/incident.service';
import { Incident } from '../../../models/incident.model';

@Component({
  selector: 'app-incident-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './incident-list.component.html',
  styleUrls: ['./incident-list.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class IncidentListComponent implements OnInit {
  incidents: Incident[] = [];
  filteredIncidents: Incident[] = [];
  searchTerm: string = '';
  activeTab: string = 'all';
  sortField: string = 'createdAt';
  sortDirection: string = 'desc';
  showFilterPanel: boolean = false;
  isLoading: boolean = false;
  
  // Status counts from server
  statusCounts: {[key: string]: number} = {};
  
  // Error handling
  errorMessage: string = '';
  showError: boolean = false;
  errorTimeout: any;

  // Advanced filters object
  advancedFilters: {
    status: string;
    severity: string;
    category: string;
    department: string;
    startDate: string;
    endDate: string;
  } = {
    status: '',
    severity: '',
    category: '',
    department: '',
    startDate: '',
    endDate: ''
  };
  
  // Column visibility settings
  visibleColumns: {[key: string]: boolean} = {
    number: true,
    title: true,
    status: true,
    severity: true,
    category: true,
    department: true,
    createdAt: true,
    reporterName: false,
    financialImpact: false
  };
  
  showColumnSelector: boolean = false;

  // Search debounce
  private searchSubject = new Subject<string>();

  // Pagination
  currentPage: number = 0;
  pageSize: number = 20;
  totalPages: number = 0;
  totalElements: number = 0;

  // Local storage key
  private readonly storageKey = 'incident_list_preferences';

  constructor(
    private incidentService: IncidentService,
    private router: Router
  ) {
    // Setup search with debounce time
    this.searchSubject.pipe(
      debounceTime(300) // Wait for 300ms pause in events
    ).subscribe(searchTerm => {
      this.applyServerFilters();
    });

    // Load saved preferences
    this.loadPreferences();
  }

  ngOnInit(): void {
    this.loadIncidents();
    this.loadStatusCounts();
  }

  /**
   * Save current preferences to localStorage
   */
  private savePreferences(): void {
    try {
      const preferences = {
        pageSize: this.pageSize,
        sortField: this.sortField,
        sortDirection: this.sortDirection,
        activeTab: this.activeTab,
        advancedFilters: this.advancedFilters,
        visibleColumns: this.visibleColumns
      };
      localStorage.setItem('incidentListPreferences', JSON.stringify(preferences));
    } catch (e) {
      console.error('Error saving preferences to localStorage', e);
    }
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    try {
      const preferences = localStorage.getItem('incidentListPreferences');
      if (preferences) {
        const parsed = JSON.parse(preferences);
        this.pageSize = parsed.pageSize || 20;
        this.sortField = parsed.sortField || 'createdAt';
        this.sortDirection = parsed.sortDirection || 'desc';
        this.activeTab = parsed.activeTab || 'all';
        
        if (parsed.advancedFilters) {
          this.advancedFilters = {
            ...this.advancedFilters,
            ...parsed.advancedFilters
          };
        }
        
        if (parsed.visibleColumns) {
          this.visibleColumns = {
            ...this.visibleColumns,
            ...parsed.visibleColumns
          };
        }
      }
    } catch (e) {
      console.error('Error loading preferences from localStorage:', e);
    }
  }

  /**
   * Display an error message to the user
   */
  showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;
    
    // Auto-dismiss error after 5 seconds
    clearTimeout(this.errorTimeout);
    this.errorTimeout = setTimeout(() => {
      this.dismissError();
    }, 5000);
  }
  
  /**
   * Dismiss the error message
   */
  dismissError(): void {
    this.showError = false;
    this.errorMessage = '';
  }

  loadIncidents(page: number = 0): void {
    const filters = this.buildFilters();
    
    this.isLoading = true;
    this.dismissError(); // Clear any previous errors
    
    this.incidentService.getIncidents(page, this.pageSize, this.sortField, this.sortDirection, filters)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (incidents: Incident[]) => {
          this.incidents = incidents;
          this.filteredIncidents = [...incidents];
          
          // Get updated pagination info from the service
          const paginationInfo = this.incidentService.getPaginationInfo();
          this.currentPage = paginationInfo.currentPage;
          this.totalPages = paginationInfo.totalPages;
          this.totalElements = paginationInfo.totalElements;
          
          // Load status counts after data is loaded
          this.loadStatusCounts();
        },
        error: (err: any) => {
          console.error('Error loading incidents', err);
          this.showErrorMessage('Failed to load incidents. Please try again later.');
        }
      });
  }

  /**
   * Calculate status counts from local incident data
   */
  loadStatusCounts(): void {
    if (!this.incidents || this.incidents.length === 0) {
      return;
    }
    
    // Initialize counts object
    this.statusCounts = {
      'INVESTIGATING': 0,
      'RESOLVED': 0, 
      'CLOSED': 0
    };
    
    // Count incidents by status
    for (const incident of this.incidents) {
      if (this.statusCounts[incident.status] !== undefined) {
        this.statusCounts[incident.status]++;
      }
    }
  }

  /**
   * Build filter object based on current UI state
   */
  private buildFilters(): IncidentFilter {
    const filters: IncidentFilter = {};

    // Add status filter if not 'all'
    if (this.activeTab !== 'all') {
      filters.status = this.mapStatusToApi(this.activeTab);
    }

    // Add search term if present
    if (this.searchTerm?.trim()) {
      filters.searchTerm = this.searchTerm.trim();
    }

    // Add advanced filters
    if (this.advancedFilters.status) {
      filters.status = this.advancedFilters.status;
    }

    if (this.advancedFilters.severity) {
      filters.severity = this.advancedFilters.severity;
    }

    if (this.advancedFilters.category) {
      filters.category = this.advancedFilters.category;
    }

    if (this.advancedFilters.department) {
      filters.department = this.advancedFilters.department;
    }

    // Handle date range filters
    if (this.advancedFilters.startDate) {
      filters.startDate = this.advancedFilters.startDate;
    }

    if (this.advancedFilters.endDate) {
      filters.endDate = this.advancedFilters.endDate;
    }

    return filters;
  }

  /**
   * Apply filters on the server-side
   */
  private applyServerFilters(): void {
    const filters = this.buildFilters();
    this.isLoading = true;
    
    this.incidentService.applyFilters(filters, this.sortField, this.sortDirection).subscribe({
      next: (incidents) => {
        this.incidents = incidents;
        this.filteredIncidents = incidents;

        // Reset to first page when filters change
        this.currentPage = 1;

        // Update pagination info
        const paginationInfo = this.incidentService.getPaginationInfo();
        this.totalPages = paginationInfo.totalPages;
        this.totalElements = paginationInfo.totalElements;
        
        // Calculate status counts locally from the filtered data
        this.loadStatusCounts();
      },
      error: (error) => {
        console.error('Error applying filters:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Filter incidents locally based on the active tab
   */
  private filterIncidentsByTab(): void {
    if (this.activeTab === 'all') {
      // Show all incidents
      this.filteredIncidents = [...this.incidents];
    } else {
      // Map the tab name to API status and filter
      const statusFilter = this.mapStatusToApi(this.activeTab);
      this.filteredIncidents = this.incidents.filter(incident => incident.status === statusFilter);
    }
  }

  // Get total count of incidents
  getTotalCount(): number {
    return this.totalElements || this.incidents.length;
  }
  
  /**
   * Toggle advanced filter panel visibility
   */
  toggleFilterPanel(): void {
    this.showFilterPanel = !this.showFilterPanel;
  }
  
  /**
   * Apply advanced filters from the filter panel
   */
  applyAdvancedFilters(): void {
    try {
      // The buildFilters method already includes advanced filters
      // Just trigger the filter application and save preferences
      this.savePreferences();
      this.applyServerFilters();
      this.showFilterPanel = false; // Close the panel after applying filters
    } catch (err) {
      console.error('Error applying advanced filters:', err);
      this.showErrorMessage('Failed to apply advanced filters. Please try again.');
    }
  }
  
  /**
   * Clear all advanced filters
   */
  clearFilters(): void {
    this.advancedFilters = {
      status: '',
      severity: '',
      category: '',
      department: '',
      startDate: '',
      endDate: ''
    };
    
    this.savePreferences();
    this.applyServerFilters(); // Apply filters without the advanced ones
  }
  
  /**
   * Toggle column visibility setting
   */
  toggleColumnVisibility(column: string): void {
    this.visibleColumns[column] = !this.visibleColumns[column];
    this.savePreferences();
  }
  
  /**
   * Toggle column selector dropdown
   */
  toggleColumnSelector(): void {
    this.showColumnSelector = !this.showColumnSelector;
  }
  
  /**
   * Reset column visibility to defaults
   */
  resetColumnVisibility(): void {
    this.visibleColumns = {
      number: true,
      title: true,
      status: true,
      severity: true,
      category: true,
      department: true,
      createdAt: true,
      reporterName: false,
      financialImpact: false
    };
    this.savePreferences();
  }
  
  /**
   * Format column key to display name
   */
  formatColumnName(key: string): string {
    // Map of column keys to display names
    const columnDisplayNames: {[key: string]: string} = {
      number: 'Incident Number',
      title: 'Title',
      status: 'Status',
      severity: 'Severity',
      category: 'Category',
      department: 'Department',
      createdAt: 'Created Date',
      reporterName: 'Reporter',
      financialImpact: 'Financial Impact'
    };
    
    return columnDisplayNames[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  }

  // Get count of incidents by status directly from the incident list
  getStatusCount(status: string): number {
    if (!this.incidents || this.incidents.length === 0) {
      return 0;
    }
    
    if (status === 'all') {
      return this.incidents.length;
    }
    
    // Map the tab name to API status and filter incidents
    const apiStatus = this.mapStatusToApi(status);
    return this.incidents.filter(incident => incident.status === apiStatus).length;
  }
  
  // Map frontend status to API status format
  private mapStatusToApi(status: string): string {
    const statusMap: {[key: string]: string} = {
      'OPEN': 'INVESTIGATING',
      'IN_PROGRESS': 'INVESTIGATING',
      'RESOLVED': 'RESOLVED', 
      'CLOSED': 'CLOSED'
    };
    return statusMap[status] || status.toUpperCase();
  }

  // Handle search functionality
  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  // Apply filter button click handler
  applyFilters(): void {
    try {
      this.loadIncidents();
    } catch (err) {
      console.error('Error applying filters:', err);
      this.showErrorMessage('Failed to apply filters. Please try again.');
    }
  }
  
  /**
   * Sort incidents by the specified field
   * @param field The field to sort by
   */
  sortBy(field: string): void {
    try {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
      this.savePreferences();
      this.loadIncidents(1);
    } catch (err) {
      console.error('Error sorting incidents:', err);
      this.showErrorMessage('Failed to sort incidents. Please try again.');
    }
  }

  /**
   * Get the current sort direction icon for a field
   * @param field The field to check
   * @returns Icon class or empty string if not sorted by this field
   */
  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return '';
    }
    return this.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc';
  }

  // Handle tab change
  onTabChange(status: string): void {
    this.activeTab = status;
    // Save preferences when tab changes
    this.savePreferences();
    
    // Reset to first page
    this.currentPage = 1;
    
    // Filter incidents locally instead of making an API call
    this.filterIncidentsByTab();
  }

  // Get CSS class for status pills
  getStatusClass(status: string): string {
    const statusMap: {[key: string]: string} = {
      'INVESTIGATING': 'open',
      'RESOLVED': 'resolved',
      'CLOSED': 'closed'
    };
    const mappedStatus = statusMap[status] || status.toLowerCase();
    return `status-${mappedStatus.replace(/\s+/g, '-')}`;
  }

  // Get CSS class for severity pills
  getSeverityClass(severity: string): string {
    return `severity-${severity.toLowerCase()}`;
  }
  
  /**
   * Go to a specific page
   */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    
    try {
      this.currentPage = page;
      this.loadIncidents(page);
      this.savePreferences();
    } catch (err) {
      console.error('Error navigating to page:', err);
      this.showErrorMessage('Failed to navigate to the selected page. Please try again.');
    }
  }
  
  /**
   * Change the page size and reload incidents
   */
  setPageSize(size: number): void {
    if (size < 1) return;
    
    try {
      this.pageSize = size;
      this.savePreferences();
      this.loadIncidents(0); // Reset to first page when changing page size
    } catch (err) {
      console.error('Error changing page size:', err);
      this.showErrorMessage('Failed to update page size. Please try again.');
    }
  }
  
  // Go to previous page
  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }
  
  // Go to next page
  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  // Navigate to incident detail
  viewIncident(id: string): void {
    this.router.navigate(['/incidents', id]);
  }

  // Create new incident
  createIncident(): void {
    this.router.navigate(['/incidents/create']);
  }

  // Check if any filters are active
  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.advancedFilters.status ||
      this.advancedFilters.severity ||
      this.advancedFilters.department ||
      this.advancedFilters.category ||
      this.advancedFilters.startDate ||
      this.advancedFilters.endDate
    );
  }

  // Clear all filters
  clearAllFilters(): void {
    this.searchTerm = '';
    this.advancedFilters = {
      status: '',
      severity: '',
      category: '',
      department: '',
      startDate: '',
      endDate: ''
    };
    
    // Reset to first page and reload data
    this.currentPage = 1;
    this.loadIncidents();
  }

  // Get count of visible columns for colspan
  getVisibleColumnCount(): number {
    return Object.values(this.visibleColumns).filter(visible => visible).length + 1; // +1 for actions column
  }
}