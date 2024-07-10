import { Component, OnInit, ViewChild } from '@angular/core';
// Import the AuthService type from the SDK
import { AuthService, User } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { StyleClassModule } from 'primeng/styleclass';
import { Sidebar } from 'primeng/sidebar';

@Component({
  selector: 'sidebar-component',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarModule, ButtonModule, RippleModule, AvatarModule, StyleClassModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isActive: boolean = false;

  toggleSidebar() {
    this.isActive = !this.isActive;
  }
}
