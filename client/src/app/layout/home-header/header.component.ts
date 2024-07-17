import { Component, OnInit } from '@angular/core';
// Import the AuthService type from the SDK
import { AuthService, User } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'home-header-component',
  standalone: true,
  imports: [CommonModule, RouterModule, AutoCompleteModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HomeHeaderComponent {
  isDarkMode = false;
  // Inject the authentication service into your component through the constructor
  constructor(public auth: AuthService) {}

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme', this.isDarkMode);
  }
}
