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
    category: 'TECHNICAL_FAILURE',
    severity: 'MEDIUM',
    riskLevel: 'MEDIUM',
    financialImpact: 0,
    affectedTransactions: '',
    customerImpactCount: 0,
    complianceFlag: false,
    involvedSystems: '',
    incidentDate: new Date().toISOString().split('T')[0] + 'T00:00:00',
    department: ''
  };
  
  // Category options for the form
  categories = [
    { value: 'TECHNICAL_FAILURE', label: 'Technical Failure' },
    { value: 'OPERATIONAL_ERROR', label: 'Operational Error' },
    { value: 'SECURITY_BREACH', label: 'Security Breach' },
    { value: 'COMPLIANCE_ISSUE', label: 'Compliance Issue' },
    { value: 'FRAUD_INCIDENT', label: 'Fraud Incident' },
    { value: 'VENDOR_PROBLEM', label: 'Vendor Problem' },
    { value: 'OTHER', label: 'Other' }
  ];
  
  // Risk level options
  riskLevels = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' }
  ];
  
  // Severity options
  severityLevels = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' }
  ];
  
  departments: string[] = [];
  isSubmitting = false;
  errors: { [key: string]: string } = {};

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

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;
    
    // Required field validation
    if (!this.incident.title || !this.incident.description || !this.incident.department || !this.incident.severity) {
      alert('Please fill in all required fields (Title, Description, Department, and Severity)');
      return false;
    }
    
    // Title length validation
    if (this.incident.title.length < 5 || this.incident.title.length > 200) {
      this.errors['title'] = 'Title must be between 5 and 200 characters';
      isValid = false;
    }
    
    // Description length validation
    if (this.incident.description.length < 20 || this.incident.description.length > 2000) {
      this.errors['description'] = 'Description must be between 20 and 2000 characters';
      isValid = false;
    }
    
    return isValid;
  }
  
  onSubmit(): void {
    // Validate the form
    if (!this.validateForm()) {
      return;
    }

    // Format financial impact as a number
    if (this.incident.financialImpact) {
      this.incident.financialImpact = Number(this.incident.financialImpact);
    }

    // Format customer impact count as a number
    if (this.incident.customerImpactCount) {
      this.incident.customerImpactCount = Number(this.incident.customerImpactCount);
    }

    this.isSubmitting = true;
    
    this.incidentService.createIncident(this.incident).subscribe({
      next: (incident) => {
        this.isSubmitting = false;
        if (incident && incident.id) {
          this.router.navigate(['/incidents', incident.id]);
        } else {
          console.error('Received null or invalid incident from API');
          this.router.navigate(['/incidents']);
          alert('Incident was created but the response was incomplete. Redirecting to incidents list.');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Failed to create incident:', error);
        alert('Failed to create incident. Please try again.');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/incidents']);
  }
}