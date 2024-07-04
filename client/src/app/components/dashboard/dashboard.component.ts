import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // Inject the authentication service into your component through the constructor
  constructor(public auth: AuthService, private router: Router) {}

  files = [
    { icon: 'assets/file-icon.png', title: 'Documents', date: 'Sep 25, 2022', sharedUsers: 80, insideFiles: 3985 },
    { icon: 'assets/file-icon.png', title: 'Insurance', date: 'Sep 25, 2022', sharedUsers: 5, insideFiles: 499 },
    { icon: 'assets/file-icon.png', title: 'Taxes', date: 'Sep 25, 2022', sharedUsers: 3, insideFiles: 256 },
    { icon: 'assets/file-icon.png', title: 'ID', date: 'Sep 25, 2022', sharedUsers: 52, insideFiles: 1225 },
    { icon: 'assets/file-icon.png', title: 'Travel ID', date: 'Sep 25, 2022', sharedUsers: 22, insideFiles: 2265 },
    { icon: 'assets/file-icon.png', title: 'Taxes 2022', date: 'Sep 25, 2022', sharedUsers: 12, insideFiles: 597 }
  ];

  suggestions = [
    { icon: 'assets/file-icon.png', title: 'Driver License.png', sharedUsers: 12, size: '2.8 MB', lastModified: 'Dec 13, 2022' },
    { icon: 'assets/file-icon.png', title: 'Tax2020.zip', sharedUsers: 5, size: '242 MB', lastModified: 'Dec 12, 2022' },
    { icon: 'assets/file-icon.png', title: 'dsfd.png', sharedUsers: 0, size: '1.8 MB', lastModified: 'Dec 12, 2022' }
  ];

  recentFiles = [
    { icon: 'assets/file-icon.png' },
    { icon: 'assets/file-icon.png' },
    { icon: 'assets/file-icon.png' },
    { icon: 'assets/file-icon.png' },
    { icon: 'assets/file-icon.png' },
    { icon: 'assets/file-icon.png' },
    { icon: 'assets/file-icon.png' },
    { icon: 'assets/file-icon.png' },
    { icon: 'assets/file-icon.png' }
  ];

  ngOnInit(): void {}

  OnFolderClick() {
    this.router.navigate(['/documents']);
  }

}
