import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
// Import the AuthService type from the SDK
import { AuthService, User } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { StyleClassModule } from 'primeng/styleclass';
import { Sidebar } from 'primeng/sidebar';

@Component({
  selector: 'sidebar-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarModule,
    ButtonModule,
    RippleModule,
    AvatarModule,
    StyleClassModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  isActive: boolean = false;
  activeRoute: string = '';
  isMobileView: boolean = false;
  isDropdownOpen: boolean = false;
  constructor(
    public auth: AuthService,
    private router: Router,
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobileView = window.innerWidth <= 768;
  }
  ngOnInit(): void {
    this.isMobileView = window.innerWidth <= 768;
    this.isDropdownOpen = false;
  }

  toggleSidebar() {
    this.isActive = !this.isActive;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  
  closeDropdown() {
    this.isDropdownOpen = false;
  }

  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }
}
