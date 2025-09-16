import { Component, OnInit } from '@angular/core';
import { TawkService } from '../../services/tawk.service';

@Component({
  selector: 'app-tawk-example',
  template: `
    <div class="tawk-controls">
      <h3>Tawk.to Chat Controls</h3>
      <div class="button-group">
        <button (click)="showChat()" class="btn btn-primary">Show Chat</button>
        <button (click)="hideChat()" class="btn btn-secondary">Hide Chat</button>
        <button (click)="toggleChat()" class="btn btn-info">Toggle Chat</button>
        <button (click)="maximizeChat()" class="btn btn-success">Maximize</button>
        <button (click)="minimizeChat()" class="btn btn-warning">Minimize</button>
      </div>
      
      <div class="visitor-info">
        <h4>Set Visitor Information</h4>
        <input 
          type="text" 
          [(ngModel)]="visitorName" 
          placeholder="Visitor Name"
          class="form-control mb-2">
        <input 
          type="email" 
          [(ngModel)]="visitorEmail" 
          placeholder="Visitor Email"
          class="form-control mb-2">
        <button (click)="setVisitorInfo()" class="btn btn-outline-primary">
          Update Visitor Info
        </button>
      </div>
      
      <div class="chat-status" *ngIf="chatStatus">
        <p><strong>Chat Status:</strong> {{ chatStatus }}</p>
      </div>
    </div>
  `,
  styles: [`
    .tawk-controls {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .button-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .btn-primary { background-color: #007bff; color: white; }
    .btn-secondary { background-color: #6c757d; color: white; }
    .btn-info { background-color: #17a2b8; color: white; }
    .btn-success { background-color: #28a745; color: white; }
    .btn-warning { background-color: #ffc107; color: black; }
    .btn-outline-primary { 
      background-color: transparent; 
      color: #007bff; 
      border: 1px solid #007bff; 
    }
    
    .visitor-info {
      margin-bottom: 20px;
    }
    
    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    
    .chat-status {
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
  `]
})
export class TawkExampleComponent implements OnInit {
  visitorName: string = '';
  visitorEmail: string = '';
  chatStatus: string = '';

  constructor(private tawkService: TawkService) {}

  ngOnInit(): void {
    // Set up event listeners when component initializes
    this.tawkService.onLoad(() => {
      console.log('Tawk.to chat widget loaded successfully!');
      this.chatStatus = 'Loaded';
    });

    this.tawkService.onStatusChange((status: string) => {
      console.log('Chat status changed:', status);
      this.chatStatus = status;
    });

    this.tawkService.onChatMaximized(() => {
      console.log('Chat maximized');
      this.chatStatus = 'Maximized';
    });

    this.tawkService.onChatMinimized(() => {
      console.log('Chat minimized');
      this.chatStatus = 'Minimized';
    });
  }

  showChat(): void {
    this.tawkService.showWidget();
  }

  hideChat(): void {
    this.tawkService.hideWidget();
  }

  toggleChat(): void {
    this.tawkService.toggleWidget();
  }

  maximizeChat(): void {
    this.tawkService.maximize();
  }

  minimizeChat(): void {
    this.tawkService.minimize();
  }

  setVisitorInfo(): void {
    if (this.visitorName) {
      this.tawkService.setVisitorName(this.visitorName);
    }
    if (this.visitorEmail) {
      this.tawkService.setVisitorEmail(this.visitorEmail);
    }
    
    if (this.visitorName || this.visitorEmail) {
      console.log('Visitor information updated');
    }
  }
}
