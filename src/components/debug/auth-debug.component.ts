import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../../services/token-storage.service';

@Component({
  selector: 'app-auth-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-container">
      <h2>Auth Debug Information</h2>
      
      <div class="debug-section">
        <h3>Authentication Status</h3>
        <p class="status" [class.status-ok]="authService.isAuthenticated()" [class.status-error]="!authService.isAuthenticated()">
          isAuthenticated: {{ authService.isAuthenticated() }}
        </p>
        <p class="status" [class.status-ok]="authService.isSupervisor()" [class.status-error]="!authService.isSupervisor()">
          isSupervisor: {{ authService.isSupervisor() }}
        </p>
        <p class="status" [class.status-ok]="authService.isAdmin()" [class.status-error]="!authService.isAdmin()">
          isAdmin: {{ authService.isAdmin() }}
        </p>
      </div>
      
      <div class="debug-section">
        <h3>Current User</h3>
        <pre class="code-block">{{ currentUserJson }}</pre>
      </div>
      
      <div class="debug-section">
        <h3>Token Information</h3>
        <p>Token Valid: {{ tokenService.isTokenValid() }}</p>
        <p>Access Token: {{ maskedToken }}</p>
        <p>Expires At: {{ tokenExpiryFormatted }}</p>
      </div>
      
      <div class="debug-section">
        <h3>User in Storage</h3>
        <pre class="code-block">{{ userInStorage }}</pre>
      </div>
      
      <div class="actions">
        <button (click)="refresh()" class="btn-primary">Refresh Data</button>
        <button (click)="logout()" class="btn-secondary">Logout</button>
      </div>
    </div>
  `,
  styles: [`
    .debug-container {
      padding: 20px;
      background: #f5f5f5;
      border-radius: 4px;
      max-width: 800px;
      margin: 20px auto;
    }
    .debug-section {
      margin-bottom: 30px;
      background: white;
      padding: 15px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h2 {
      margin-top: 0;
      margin-bottom: 20px;
      color: #333;
    }
    h3 {
      margin-top: 0;
      color: #555;
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
    }
    .status {
      padding: 8px 12px;
      border-radius: 4px;
      margin: 5px 0;
    }
    .status-ok {
      background: #e6f7e6;
      color: #2e7d32;
    }
    .status-error {
      background: #ffebee;
      color: #c62828;
    }
    .code-block {
      background: #f8f8f8;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: monospace;
      white-space: pre-wrap;
    }
    .actions {
      display: flex;
      gap: 10px;
    }
    button {
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      border: none;
      font-weight: bold;
    }
    .btn-primary {
      background: #1976d2;
      color: white;
    }
    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }
  `]
})
export class AuthDebugComponent implements OnInit {
  currentUserJson = 'null';
  maskedToken = 'No token found';
  tokenExpiryFormatted = 'N/A';
  userInStorage = 'null';

  constructor(
    public authService: AuthService,
    public tokenService: TokenStorageService
  ) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    // Get current user
    const currentUser = this.authService.getCurrentUser();
    this.currentUserJson = currentUser ? JSON.stringify(currentUser, null, 2) : 'null';
    
    // Get token information
    const token = this.tokenService.getAccessToken();
    if (token) {
      // Mask the token for security but show the first and last few characters
      this.maskedToken = token.substring(0, 6) + '...' + token.substring(token.length - 4);
    }
    
    // Get token expiry
    const tokenData = this.tokenService.getToken();
    if (tokenData && tokenData.expiresAt) {
      const expiryDate = new Date(tokenData.expiresAt);
      this.tokenExpiryFormatted = expiryDate.toLocaleString() + 
        ` (${this.getRemainingTime(tokenData.expiresAt)})`;
    }
    
    // Get raw user from storage
    const storedUser = this.tokenService.getUser();
    this.userInStorage = storedUser ? JSON.stringify(storedUser, null, 2) : 'null';
  }
  
  logout() {
    this.authService.logout();
    window.location.reload();
  }
  
  private getRemainingTime(expiresAt: number): string {
    const now = Date.now();
    const remaining = expiresAt - now;
    
    if (remaining < 0) {
      return 'Expired';
    }
    
    // Convert remaining milliseconds to minutes
    const minutes = Math.floor(remaining / 60000);
    
    if (minutes < 60) {
      return `${minutes} minute(s) remaining`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hour(s) ${remainingMinutes} minute(s) remaining`;
    }
  }
}
