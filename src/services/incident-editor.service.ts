import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IncidentEditorService {
  // Track which incident is currently being edited
  private editModeSubject = new BehaviorSubject<string | null>(null);
  public editMode$ = this.editModeSubject.asObservable();

  constructor() { }

  // Enable edit mode for a specific incident
  activateEditMode(incidentId: string): void {
    this.editModeSubject.next(incidentId);
  }

  // Check if a specific incident is in edit mode
  isInEditMode(incidentId: string): boolean {
    return this.editModeSubject.value === incidentId;
  }

  // Disable edit mode
  deactivateEditMode(): void {
    this.editModeSubject.next(null);
  }
}
