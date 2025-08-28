import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  isLoading = false;
  errorMessage = '';
  userId: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadUser();
    } else {
      this.router.navigate(['/users']);
    }
  }

  loadUser(): void {
    if (!this.userId) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load user';
        this.isLoading = false;
      }
    });
  }

  toggleUserStatus(): void {
    if (!this.user || !this.canManageUsers()) {
      this.errorMessage = 'You do not have permission to manage users';
      return;
    }

    const action = this.user.active ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      this.userService.toggleUserStatus(this.user.id, !this.user.active).subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to update user status';
        }
      });
    }
  }

  deleteUser(): void {
    if (!this.user || !this.canManageUsers()) {
      this.errorMessage = 'You do not have permission to delete users';
      return;
    }

    if (confirm(`Are you sure you want to delete user "${this.user.name}"? This action cannot be undone.`)) {
      this.userService.deleteUser(this.user.id).subscribe({
        next: () => {
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to delete user';
        }
      });
    }
  }

  // Permission checks
  canManageUsers(): boolean {
    return this.authService.isAdmin();
  }

  canEditUser(): boolean {
    return this.authService.isAdmin();
  }

  // Display helpers
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

  getStatusBadgeClass(active: boolean): string {
    return active ? 'status-active' : 'status-inactive';
  }

  getRoleBadgeClass(role: string): string {
    return `role-${role.toLowerCase()}`;
  }
}
