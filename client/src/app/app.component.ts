// app.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ApiService } from './services/api.service';
import * as THREE from 'three';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  showHeader = true;
  showSidebar = true;
  constructor(
    public apiService: ApiService,
    private router: Router,
    public auth: AuthService,
  ) {}
  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        this.showHeader = !url.includes('/credits');
        this.showSidebar = !url.includes('/credits');
      }
    });
  }
}
