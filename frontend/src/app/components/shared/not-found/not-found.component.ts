import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <mat-icon class="not-found-icon">error_outline</mat-icon>
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <button mat-raised-button color="primary" routerLink="/dashboard">
          <mat-icon>home</mat-icon>
          Go to Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: calc(100vh - 200px);
      padding: 20px;
    }
    
    .not-found-content {
      text-align: center;
      max-width: 500px;
    }
    
    .not-found-icon {
      font-size: 96px;
      width: 96px;
      height: 96px;
      color: #757575;
      margin-bottom: 24px;
    }
    
    h1 {
      font-size: 2rem;
      margin-bottom: 16px;
      color: #333;
    }
    
    p {
      font-size: 1.1rem;
      margin-bottom: 32px;
      color: #666;
    }
    
    button {
      padding: 12px 24px;
      font-size: 16px;
    }
    
    button mat-icon {
      margin-right: 8px;
    }
  `]
})
export class NotFoundComponent {}
