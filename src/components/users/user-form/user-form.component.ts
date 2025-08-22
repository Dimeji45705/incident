import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CreateUserRequest, User } from '../../../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  user: CreateUserRequest = {
    name: '',
    email: '',
    role: 'user',
    primaryDepartment: '',
    additionalDepartments: [],
    isSupervisor: false
  };
  
  departments: string[] = [];
  isSubmitting = false;
  isEdit = false;
  userId: string | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userService.getDepartments().subscribe(departments => {
      this.departments = departments;
    });

    // Check if this is an edit operation
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEdit = true;
      this.loadUser();
    }
  }

  loadUser(): void {
    if (this.userId) {
      this.userService.getUserById(this.userId).subscribe(user => {
        if (user) {
          this.user = {
            name: user.name,
            email: user.email,
            role: user.role,
            primaryDepartment: user.primaryDepartment,
            additionalDepartments: [...user.additionalDepartments],
            isSupervisor: user.isSupervisor
          };
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
    if (!this.user.name || !this.user.email || !this.user.primaryDepartment || !this.user.role) {
      return;
    }

    this.isSubmitting = true;
    
    if (this.isEdit && this.userId) {
      this.userService.updateUser(this.userId, this.user).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Failed to update user:', error);
        }
      });
    } else {
      this.userService.createUser(this.user).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Failed to create user:', error);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}