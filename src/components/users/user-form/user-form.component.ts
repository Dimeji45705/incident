import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { CreateUserRequest, UpdateUserRequest, User } from '../../../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  user: CreateUserRequest & UpdateUserRequest = {
    name: '',
    email: '',
    role: 'EMPLOYEE',
    primaryDepartment: '',
    additionalDepartments: []
  };
  
  departments: string[] = [
    'TECH_TEAM',
    'OPERATIONS_TEAM',
    'COMPLIANCE_TEAM',
    'FINANCE_TEAM',
    'SECURITY_TEAM',
    'PRODUCT_TEAM',
    'CUSTOMER_SUPPORT',
    'GENERAL',
    'VENDOR_MANAGEMENT'
  ];
  
  roles = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
    { value: 'EMPLOYEE', label: 'Employee' }
  ];
  
  isSubmitting = false;
  isEdit = false;
  userId: string | null = null;
  errorMessage = '';
  originalUser: User | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check permissions
    if (!this.canManageUsers()) {
      this.router.navigate(['/users']);
      return;
    }

    // Check if this is an edit operation
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEdit = true;
      this.loadUser();
    }
  }

  loadUser(): void {
    if (this.userId) {
      this.userService.getUserById(this.userId).subscribe({
        next: (user) => {
          this.originalUser = user;
          this.user = {
            name: user.name,
            email: user.email,
            role: user.role,
            primaryDepartment: user.primaryDepartment,
            additionalDepartments: [...user.additionalDepartments]
          };
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to load user';
        }
      });
    }
  }

  onDepartmentChange(department: string, event: any): void {
    if (event.target.checked) {
      if (!this.user.additionalDepartments.includes(department)) {
        this.user.additionalDepartments.push(department);
      }
    } else {
      this.user.additionalDepartments = this.user.additionalDepartments.filter(d => d !== department);
    }
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    
    if (this.isEdit && this.userId) {
      // Only include changed fields in update
      const updateData: UpdateUserRequest = {};
      if (this.user.name !== this.originalUser?.name) updateData.name = this.user.name;
      if (this.user.role !== this.originalUser?.role) updateData.role = this.user.role;
      if (this.user.primaryDepartment !== this.originalUser?.primaryDepartment) {
        updateData.primaryDepartment = this.user.primaryDepartment;
      }
      if (JSON.stringify(this.user.additionalDepartments) !== JSON.stringify(this.originalUser?.additionalDepartments)) {
        updateData.additionalDepartments = this.user.additionalDepartments;
      }

      this.userService.updateUser(this.userId, updateData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.message || 'Failed to update user';
        }
      });
    } else {
      this.userService.createUser(this.user as CreateUserRequest).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.message || 'Failed to create user';
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }

  // Permission checks
  canManageUsers(): boolean {
    return this.authService.isAdmin();
  }

  // Form validation
  isFormValid(): boolean {
    return !!(
      this.user.name?.trim() &&
      this.user.email?.trim() &&
      this.user.primaryDepartment &&
      this.user.role &&
      this.isValidEmail(this.user.email)
    );
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Department helpers
  getDepartmentDisplayName(department: string): string {
    return department.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  isDepartmentSelected(department: string): boolean {
    return this.user.additionalDepartments?.includes(department) || false;
  }
}