import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IncidentService } from '../../../services/incident.service';
import { UserService } from '../../../services/user.service';
import { CreateIncidentRequest } from '../../../models/incident.model';

@Component({
  selector: 'app-incident-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './incident-form.component.html',
  styleUrls: ['./incident-form.component.scss']
})
export class IncidentFormComponent implements OnInit {
  incident: CreateIncidentRequest = {
    title: '',
    description: '',
    severity: 'medium',
    department: ''
  };
  
  departments: string[] = [];
  isSubmitting = false;

  constructor(
    private incidentService: IncidentService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.getDepartments().subscribe(departments => {
      this.departments = departments;
    });
  }

  onSubmit(): void {
    if (!this.incident.title || !this.incident.description || !this.incident.department) {
      return;
    }

    this.isSubmitting = true;
    
    this.incidentService.createIncident(this.incident).subscribe({
      next: (incident) => {
        this.isSubmitting = false;
        this.router.navigate(['/incidents', incident.id]);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Failed to create incident:', error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/incidents']);
  }
}