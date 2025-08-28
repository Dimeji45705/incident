import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { User, UserFilter } from '../../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class UserListComponent implements OnInit {
  allUsers: User[] = []; // All users loaded from API
  filteredUsers: User[] = []; // Users after applying filters
  displayedUsers: User[] = []; // Users for current page
  isLoading = false;
  errorMessage = '';
  
  // Client-side pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Filtering
  activeTab = 'all';
  searchTerm = '';
  selectedRole = 'all';
  selectedDepartment = 'all';
  departments: string[] = [];

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAllUsers();
  }

  loadAllUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Load all users at once for client-side operations
    this.userService.getUsers(0, 1000, 'createdAt', 'desc', {}).subscribe({
      next: (response) => {
        this.allUsers = response.content;
        this.extractDepartments();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load users';
        this.isLoading = false;
      }
    });
  }

  extractDepartments(): void {
    const deptSet = new Set<string>();
    this.allUsers.forEach(user => {
      deptSet.add(user.primaryDepartment);
      if (user.additionalDepartments) {
        user.additionalDepartments.forEach(dept => deptSet.add(dept));
      }
    });
    this.departments = Array.from(deptSet).sort();
  }

  // Client-side filtering and pagination
  applyFilters(): void {
    let filtered = [...this.allUsers];

    // Apply status filter from tab
    if (this.activeTab === 'active') {
      filtered = filtered.filter(user => user.active);
    } else if (this.activeTab === 'inactive') {
      filtered = filtered.filter(user => !user.active);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }

    // Apply department filter
    if (this.selectedDepartment !== 'all') {
      filtered = filtered.filter(user => 
        user.primaryDepartment === this.selectedDepartment ||
        (user.additionalDepartments && user.additionalDepartments.includes(this.selectedDepartment))
      );
    }

    this.filteredUsers = filtered;
    this.totalElements = filtered.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    
    // Reset to first page if current page is beyond range
    if (this.currentPage >= this.totalPages) {
      this.currentPage = 0;
    }

    this.updateDisplayedUsers();
  }

  updateDisplayedUsers(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }

  // Tab functionality
  onTabChange(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 0;
    this.applyFilters();
  }

  // Search functionality
  onSearch(): void {
    this.currentPage = 0;
    this.applyFilters();
  }

  // Role filter
  onRoleFilter(role: string): void {
    this.selectedRole = role;
    this.currentPage = 0;
    this.applyFilters();
  }

  // Department filter
  onDepartmentFilter(department: string): void {
    this.selectedDepartment = department;
    this.currentPage = 0;
    this.applyFilters();
  }

  // Pagination
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateDisplayedUsers();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateDisplayedUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updateDisplayedUsers();
    }
  }

  // User actions
  toggleUserStatus(user: User): void {
    const newStatus = !user.active;
    this.userService.toggleUserStatus(user.id, newStatus).subscribe({
      next: (updatedUser) => {
        // Update user in all arrays
        const allIndex = this.allUsers.findIndex(u => u.id === user.id);
        if (allIndex !== -1) {
          this.allUsers[allIndex] = updatedUser;
        }
        this.applyFilters();
      },
      error: (error) => {
        alert(`Failed to update user status: ${error.message}`);
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          // Remove user from all arrays
          this.allUsers = this.allUsers.filter(u => u.id !== user.id);
          this.applyFilters();
        },
        error: (error) => {
          alert(`Failed to delete user: ${error.message}`);
        }
      });
    }
  }

  // Permission checks
  canCreateUser(): boolean {
    return this.authService.isAdmin();
  }

  canManageUsers(): boolean {
    return this.authService.isAdmin();
  }

  // Status display helpers
  getStatusCount(status: string): number {
    if (!this.allUsers || this.allUsers.length === 0) {
      return 0;
    }

    switch (status) {
      case 'active':
        return this.allUsers.filter(u => u.active).length;
      case 'inactive':
        return this.allUsers.filter(u => !u.active).length;
      default:
        return this.allUsers.length;
    }
  }

  // Add Math reference for template
  Math = Math;

  // Clear all filters
  clearFilters(): void {
    this.activeTab = 'all';
    this.searchTerm = '';
    this.selectedRole = 'all';
    this.selectedDepartment = 'all';
    this.currentPage = 0;
    this.applyFilters();
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'SUPERVISOR':
        return 'Supervisor';
      case 'EMPLOYEE':
        return 'Employee';
      default:
        return role;
    }
  }

  getDepartmentDisplayName(department: string): string {
    return department.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}