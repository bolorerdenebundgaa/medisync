import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { WebAuthService } from './services/web-auth.service';
import { AuthGuard } from './guards/auth.guard';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { WebAuthGuard } from './guards/web-auth.guard';

@NgModule({
  imports: [CommonModule],
  providers: [
    AuthService,
    WebAuthService,
    AuthGuard,
    AdminAuthGuard,
    WebAuthGuard
  ]
})
export class AuthModule {}